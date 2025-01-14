from flask import Blueprint, jsonify, request, current_app
import pyodbc
import os
from dotenv import load_dotenv
from utils.response_utils import success_response, error_response
from utils.db_utils import prepare_query_and_params

bp = Blueprint('db', __name__, url_prefix='/api/db')
load_dotenv()
config = {
    'driver': '{ODBC Driver 17 for SQL Server}',
    'server': os.getenv('AZURE_DB_SERVER'),
    'database': os.getenv('AZURE_DB_NAME'),
    'user': os.getenv('AZURE_DB_USER'),
    'password': os.getenv('AZURE_DB_PASSWORD'),
    'Encrypt': 'yes',
    'TrustServerCertificate': 'no'
}
def get_connection():
    conn_str = (
        f"DRIVER={config['driver']};"
        f"SERVER={config['server']};"
        f"DATABASE={config['database']};"
        f"UID={config['user']};"
        f"PWD={config['password']};"
        f"Encrypt={config['Encrypt']};"
        f"TrustServerCertificate={config['TrustServerCertificate']};"
    )
    return pyodbc.connect(conn_str)

@bp.route('', methods=['GET'])
def test_connection():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT 1')
            result = cursor.fetchone()
            if result and result[0] == 1:
                return success_response(
                    {'connected': True},
                    'Database connected successfully'
                )
            else:
                return error_response(
                    'Database test query failed',
                    'Query returned unexpected result',
                    status_code=500
                )
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        current_app.logger.error(f'Database Connection Error: {str(e)}')
        return error_response(
            'Database connection failed',
            str(e),
            status_code=500
        )


@bp.route('', methods=['POST'])
def execute_query():
    try:
        data = request.get_json()
        query = data.get('query')
        params = data.get('params', {})
        if not query:
            return error_response('Query is required', status_code=400)
        current_app.logger.debug(f"Query: {query}")
        current_app.logger.debug(f"Params: {params}")
        try:
            prepared_query, param_values = prepare_query_and_params(query, params)
            current_app.logger.debug(f"Prepared Query: {prepared_query}")
            current_app.logger.debug(f"Param Values: {param_values}")
        except Exception as e:
            return error_response(
                'Invalid query parameters',
                details=str(e),
                status_code=400
            )

        conn = get_connection()
        cursor = conn.cursor()
        try:
            if param_values:
                cursor.execute(prepared_query, param_values)
            else:
                cursor.execute(prepared_query)
            try:
                columns = [column[0] for column in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                for result in results:
                    for key, value in result.items():
                        if hasattr(value, 'isoformat'):
                            result[key] = value.isoformat()
            except:
                results = []
            conn.commit()
            return success_response({'recordset': results})

        except Exception as e:
            conn.rollback()
            current_app.logger.error(f"Database Query Error: {str(e)}")
            return error_response(
                'Database query failed',
                details=str(e),
                status_code=500
            )
        finally:
            cursor.close()
            conn.close()
    except Exception as e:
        current_app.logger.error(f'Database Query Error: {str(e)}')
        return error_response(
            'Database query failed',
            details=str(e),
            status_code=500
        )

CREATE_TABLES_QUERY = """
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        userId NVARCHAR(64) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserChatNames')
BEGIN
    CREATE TABLE UserChatNames (
        userId NVARCHAR(64) NOT NULL,
        chatId NVARCHAR(64) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (userId, chatId)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatNames')
BEGIN
    CREATE TABLE ChatNames (
        chatId NVARCHAR(64) PRIMARY KEY,
        chatName NVARCHAR(255) DEFAULT 'This chat does not have a name yet',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatNamesConversations')
BEGIN
    CREATE TABLE ChatNamesConversations (
        chatId NVARCHAR(64),
        convoId NVARCHAR(64),
        createdAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (chatId, convoId),
        FOREIGN KEY (chatId) REFERENCES ChatNames(chatId)
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        convoId NVARCHAR(64) PRIMARY KEY,
        convoPerson NVARCHAR(10) CHECK (convoPerson IN ('user', 'gpt')),
        convoContent NVARCHAR(MAX),
        convoTimestamp DATETIME DEFAULT GETDATE()
    );
END;
"""

DROP_TABLES_QUERY = """
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    DROP TABLE Conversations;
END;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatNamesConversations')
BEGIN
    DROP TABLE ChatNamesConversations;
END;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ChatNames')
BEGIN
    DROP TABLE ChatNames;
END;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'UserChatNames')
BEGIN
    DROP TABLE UserChatNames;
END;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    DROP TABLE Users;
END;
"""

@bp.route('/init', methods=['POST'])
def init_database():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(CREATE_TABLES_QUERY)
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Database tables created successfully'
        })
    except Exception as e:
        print('Failed to initialize database:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Failed to initialize database'
        }), 500

@bp.route('/init', methods=['DELETE'])
def drop_tables():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(DROP_TABLES_QUERY)
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Database tables deleted successfully'
        })
    except Exception as e:
        print('Failed to delete database tables:', str(e))
        return jsonify({
            'status': 'error',
            'message': 'Failed to delete database tables'
        }), 500
