import socketio

# asyncio
sio = socketio.Client()

# @sio.event
# def connect():
#     print('connection established')
#     sio.emit('processInput', {'foo': 'bar'})

# @sio.event
# def my_message(data):
#     print('message received with ', data)
#     sio.emit('my response', {'response': 'my response'})

@sio.on('*')
def catch_all(event, data):
    print("*")
    print(event)
    print(data)
    print("**")
    sio.emit('server__processInput', {'foo': 'bar'})

# @sio.event
# def disconnect():
#     print('disconnected from server')

sio.connect('http://localhost:3000')
sio.wait()
