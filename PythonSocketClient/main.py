import queue
import threading
from queue import Queue
import socketio
from flask import Flask
from flask import request
from flask_restful import Api, Resource
import math

import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


def start_sio(sio_obj, q_output = None):

    def steer(objects):

        player_ship = None
        target = None
        distance_to_target = math.inf
        closest_target = None
        closestDistance = math.inf

        for game_object in objects:

            if game_object["type"] == "Me":
                player_ship = game_object
                break

        if player_ship is None:
            return

        for game_object in objects:
            if game_object["type"] != "Me":

                distance_to_target = distanceToTargetSquared(player_ship["position"]["x"],
                                                            player_ship["position"]["y"],
                                                            game_object["position"]["x"],
                                                            game_object["position"]["y"],
                                                            game_object["gameFieldWidth"],
                                                            game_object["gameFieldHeight"])

                if distance_to_target < closestDistance:
                    closest_target = game_object
                    closestDistance = distance_to_target

        target = closest_target

        if target is not None:
            vector_x = shortestVector(player_ship["position"]["x"], target["position"]["x"], target["gameFieldWidth"])
            vector_y = shortestVector(player_ship["position"]["y"], target["position"]["y"], target["gameFieldWidth"])

            angle_to_target = math.atan2(vector_x, vector_y) / math.pi * 180
            angle_to_target *= -1
            angle_to_target += 90  # game uses zero angle on the right, clockwise

            if angle_to_target < 0:
                angle_to_target = angle_to_target + 360

            turn_to_right = shortestVector(player_ship["angle"], angle_to_target, 360)

            if turn_to_right > 4:
                turn_right(sio_obj, 5)
            elif turn_to_right < -4:
                turn_left(sio_obj, 5)
            else:
                accelerate(sio_obj, 1)

            if 4 > turn_to_right > -4 and distance_to_target < 150000:
                shoot(sio_obj)

    def shortestVector(p1, p2, wrap_dist):

        d = abs(p2 - p1)
        if d > abs(p2 + wrap_dist - p1):
            p2 += wrap_dist
        elif d > abs(p1 + wrap_dist - p2):
            p1 += wrap_dist

        return p2 - p1

    def distanceToTargetSquared(x, y, targetX, targetY, width, height):
        dx = shortestVector(x, targetX, width)
        dy = shortestVector(y, targetY, height)

        return dx * dx + dy * dy

    def turn_right(sio_obj1, value):
        emit_move(sio_obj1, "right", value)

    def accelerate(sio_obj1, value):
        emit_move(sio_obj1, "up", value)

    def turn_left(sio_obj1, value):
        emit_move(sio_obj1, "left", value)

    def shoot(sio_obj1):
        emit_move(sio_obj1, "space")

    def emit_move(sio_obj1, input="", value=0):

        sio_obj1.messageIndex += 1

        move_data = {
            "messageIndex": sio_obj1.messageIndex,
            'step': sio_obj1.step + 3,
            'input': input,
            'value': value,
            "playerId": sio_obj1.playerId,
            'options': {"movement": True}}

        sio_obj.emit('move', move_data)


    @sio_obj.event
    def connect():
        print('connection established')
        sio_obj.emit('requestRestart')

    @sio_obj.event
    def playerJoined(data):
        print("playerJoined")
        sio_obj.playerId = data["playerId"]
        sio_obj.messageIndex = sio_obj.playerId * 1000

    @sio_obj.event
    def worldUpdate(data):

        sio_obj.step = data["step"]
        sio_obj.objects = data["gameObjects"]

        steer(sio_obj.objects)

        # if not sio_obj.qOutput.empty():

            # output_data = sio_obj.qOutput.get(False)
            #
            # sio_obj.qOutput.task_done()

            # if not output_data.get("input") is None:
        # if sio_obj.input != "":
        #     sio_obj.messageIndex += 1
        #     move_data = {
        #         "messageIndex": sio_obj.messageIndex,
        #         'step': sio_obj.step,
        #         'input': sio_obj.input, #output_data.get("input"),
        #         'value': sio_obj.value, #output_data.get("value"),
        #         "playerId": sio_obj.playerId,
        #         'options': {"movement": True}}
        #
        #     sio_obj.emit('move', move_data)
        #     sio_obj.input = ""
        #     sio_obj.value = 0

            # print("moved")
            # print(move_data)
        # print(sio_obj.objects)

        # with sio.qInput.mutex:
        #     sio.qInput.queue.clear()
        #
        # print(sio.objects)

    # @sio_obj.on('*')
    # def catch_all(event, data):
    #     print("*")
    #     print(event)
    #     print(data)
    #     print("**")

    @sio_obj.event
    def disconnect():
        print('disconnected from server')

    sio_obj.connect('http://localhost:3000')
    sio_obj.messageIndex = 0
    sio_obj.playerId = 0
    sio_obj.step = 0
    sio_obj.objects = []
    sio_obj.wait()


def start_flask(sio, qOutput = None):
    app = Flask(__name__)
    api = Api(app)

    class Chats(Resource):

        def __init__(self, **kwargs):
            super().__init__()
            self.sio = kwargs.get("sio")
            self.qOutput = kwargs.get("qOutput")

        def get(self):
            # self.qOutput.put(request.args)

            # print(request.args.get('id'))
            self.sio.input = request.args.get("input", "")
            self.sio.value = request.args.get("value", 0)

            data = {"step": sio.step, "objects": sio.objects}
            # print(data)
            return data, 200

    api.add_resource(Chats, "/api", resource_class_kwargs={'sio': sio, "qOutput": qOutput})

    if __name__ == '__main__':
        app.run()


if __name__ == '__main__':
    # qOutput = queue.LifoQueue()

    sio = socketio.Client()  # logger=True, engineio_logger=True
    # sio.qOutput = qOutput
    sio.value = 0
    sio.input = ""

    thread_one = threading.Thread(target=start_sio, args=(sio,))#, qOutput))
    thread_two = threading.Thread(target=start_flask, args=(sio,))#, qOutput))

    thread_one.start()
    thread_two.start()

    # qOutput.join()
