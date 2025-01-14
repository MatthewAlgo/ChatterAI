


if ! command -v odbcinst &> /dev/null; then
    echo "Installing ODBC dependencies..."
    if [ -f /etc/debian_version ]; then
        
        curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
        curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list > /etc/apt/sources.list.d/mssql-release.list
        sudo apt-get update
        sudo ACCEPT_EULA=Y apt-get install -y msodbcsql17 unixodbc-dev
    elif [ -f /etc/redhat-release ]; then
        
        sudo curl https://packages.microsoft.com/config/rhel/8/prod.repo > /etc/yum.repos.d/mssql-release.repo
        sudo ACCEPT_EULA=Y yum install -y msodbcsql17 unixODBC-devel
    else
        echo "Unsupported distribution. Please install ODBC Driver 17 manually."
        exit 1
    fi
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi
source venv/bin/activate
echo "Installing requirements..."
pip install -r requirements.txt
mkdir -p logs

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Warning: Port 3000 is already in use"
    echo "Attempting to kill existing process..."
    lsof -ti:3000 | xargs kill -9
fi

echo "Starting Flask application..."
python app.py
