import paho.mqtt.client as mqtt
import json 
import time 
#this needs to match the broker and port in the app 
broker_address = "broker.hivemq.com"
broker_port = 8000
# Experiment by changing the topic
#this topic is for sending task messages
topic_tasks  = 'UAV/topic/tasks'
#this will change the button from WAIT to GO
topic_start_tasks = 'UAV/topic/start'
#this will change the button from GO to wait
topic_end_curr_tasks = 'UAV/topic/done'
#change here 
topic = topic_end_curr_tasks
topic = topic_tasks
connected = False 

#connectt 
#connect 
def on_connect(client, userdata, flags, rc):
    global connected
    if rc == 0:
        print("Connected to MQTT broker")
        connected = True 
    else:
        print("Can't connect")



# Create an MQTT client
client = mqtt.Client(transport="websockets")
# Set the callback functions
client.on_connect = on_connect
# Connect to the MQTT broker
client.connect(broker_address, broker_port)
client.loop_start()
while not connected:
    pass


# # old
# task_array = ["Set geofence parameters to altitude of 300.", "Raise throttle once you see the drone takeoff." , "Change RTL parameters to a different home location." , "Change to RTL to test the change.", "Change mode from stabilized to land." ]
# for task in task_array:
#     print('publishing')
#     task_json = json.dumps(task)
#     client.publish(topic, task_json.strip('\"'))
#     time.sleep(10)



# function that publishes a series of tasks 
def message(tasks_arr, time_arr):
    for i in range(len(tasks_arr)):
        time.sleep(time_arr[i])
        print('publishing')
        task_json = json.dumps(tasks_arr[i])
        client.publish(topic, task_json.strip('\"'))
        
# test 1 
test1_tasks = ["Place the throttle in the central position", "Switch to stabilized mode", "Change mode to RTL"]
test1_time = [25, 90, 60]
message(test1_tasks, test1_time)

# test 2
test2_tasks = ["Place the throttle just above the neutral position", "Deactivate the geofence", "Change mode to POS HOLD", "Change mode to STABILIZE"]
test2_time = [30, 45, 60, 5]
message(test2_tasks, test2_time)

# test 3
test3_tasks = ["Hit kill switch"]
test3_time = [50]
message(test3_tasks, test3_time)


