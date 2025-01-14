from flask import Blueprint, jsonify, request
from database.connection_pool import get_db_pool
from middleware.error_handler import DatabaseError, ValidationError
from utils.logger import get_logger
from utils.response_utils import success_response, error_response
import uuid
from services.openai_service import get_completion

bp = Blueprint('chat', __name__, url_prefix='/api/chat')
logger = get_logger(__name__)

@bp.route('/chat', methods=['POST'])
def create_chat():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        if not user_id:
            raise ValidationError("userId is required")
        chat_id = str(uuid.uuid4())
        pool = get_db_pool()
        conn = pool.get_connection()
        
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO ChatNames (chatId)
                VALUES (?)
            """, (chat_id,))

            cursor.execute("""
                INSERT INTO UserChatNames (userId, chatId)
                VALUES (?, ?)
            """, (user_id, chat_id))
            
            conn.commit()
            return jsonify({
                'chatId': chat_id,
                'message': 'Chat created successfully'
            }), 200
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Failed to create chat: {str(e)}")
        finally:
            cursor.close()
            pool.return_connection(conn)
            
    except Exception as e:
        logger.error(f"Error in create_chat: {str(e)}")
        raise

@bp.route('/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    try:
        pool = get_db_pool()
        conn = pool.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT chatId, chatName, createdAt, updatedAt 
                FROM ChatNames 
                WHERE chatId = ?
            """, (chat_id,))
            chat_info = cursor.fetchone()
            if not chat_info:
                return error_response("Chat not found", status_code=404)
            
            cursor.execute("""
                SELECT conv.convoId, conv.convoPerson, conv.convoContent, conv.convoTimestamp
                FROM Conversations conv
                JOIN ChatNamesConversations cnc ON conv.convoId = cnc.convoId
                WHERE cnc.chatId = ?
                ORDER BY conv.convoTimestamp ASC
            """, (chat_id,))
            conversations = cursor.fetchall()
            chat_data = {
                'chatId': chat_info[0],
                'chatName': chat_info[1] or 'New Chat',
                'createdAt': chat_info[2].isoformat() if chat_info[2] else None,
                'updatedAt': chat_info[3].isoformat() if chat_info[3] else None,
                'conversations': []
            }
            
            if conversations:
                chat_data['conversations'] = [{
                    'convoId': conv[0],
                    'person': conv[1],
                    'content': conv[2],
                    'timestamp': conv[3].isoformat() if conv[3] else None
                } for conv in conversations]
            return success_response(chat_data)
        finally:
            cursor.close()
            pool.return_connection(conn)
            
    except Exception as e:
        logger.error(f"Error in get_chat: {str(e)}")
        return error_response(str(e), status_code=500)

@bp.route('/chat/<chat_id>/message', methods=['POST'])
def add_message(chat_id):
    try:
        data = request.get_json()
        content = data.get('content')
        person = data.get('person')
        if not content or not person:
            return error_response("Missing required fields: content and person", status_code=400)
        if person not in ['user', 'gpt']:
            return error_response("Invalid person value: must be 'user' or 'gpt'", status_code=400)
        convo_id = str(uuid.uuid4())
        pool = get_db_pool()
        conn = pool.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM ChatNames WHERE chatId = ?", (chat_id,))
            if not cursor.fetchone():
                return error_response("Chat not found or access denied", status_code=404)
            cursor.execute("BEGIN TRANSACTION")
            try:
                
                cursor.execute("""
                    INSERT INTO Conversations (convoId, convoPerson, convoContent)
                    VALUES (?, ?, ?)
                """, (convo_id, person, content))
                cursor.execute("""
                    INSERT INTO ChatNamesConversations (chatId, convoId)
                    VALUES (?, ?)
                """, (chat_id, convo_id))
                cursor.execute("""
                    UPDATE ChatNames
                    SET updatedAt = GETDATE()
                    WHERE chatId = ?
                """, (chat_id,))
                
                cursor.execute("COMMIT")
                return success_response({
                    'convoId': convo_id,
                    'chatId': chat_id,
                    'content': content,
                    'person': person,
                    'timestamp': cursor.execute("SELECT GETDATE()").fetchval()
                }, 'Message added successfully')
                
            except Exception as e:
                cursor.execute("ROLLBACK")
                raise e
                
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error in add_message: {str(e)}")
            return error_response(
                'Database operation failed',
                details=str(e),
                status_code=500
            )
        finally:
            cursor.close()
            pool.return_connection(conn)
    except Exception as e:
        logger.error(f"Error in add_message: {str(e)}")
        return error_response('Internal server error', status_code=500)

@bp.route('', methods=['POST'])
def chat_completion():
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        chat_id = data.get('chatId')
        if not messages or not chat_id:
            raise ValidationError("messages and chatId are required")
        try:
            ai_response = get_completion(messages)
            return success_response({
                'recordset': [{
                    'content': ai_response,
                    'role': 'assistant'
                }]
            })
        except Exception as e:
            logger.error(f"OpenAI Error: {str(e)}")
            return error_response(
                'Failed to get AI response',
                details=str(e),
                status_code=500
            )
            
    except Exception as e:
        logger.error(f"Error in chat_completion: {str(e)}")
        return error_response(str(e), status_code=500)
