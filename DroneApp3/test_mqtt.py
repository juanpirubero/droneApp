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


json_message = {"task": "raise throttle" , "role": "RPIC", "directions": "move throttle just above neutral position"}
# Publish the message continuously 
while True:
    print('publishing')
    #change the second argument to any message to test
    task = json.dumps(json_message["task"])
    client.publish(topic, task.strip('\"'))
# note: we could even make another key in the json message for time so each task could have its own time to complete, 
# or we could just keep the time the same for all the different tasks. lmk what you guys prefer / if it matters 

# i also left the tasks numbered bc jane will send me what she wants the task to say 

json_message = {"task": ["set geofence parameters to altitude of 300", "raise throttle once you see the drone takeoff" , "change RTL parameters to a different home location" , "change to RTL to test the change", "change mode from stabilized to land"], "directions": ["Move throttle just above neutral position.", "directions2", "directions3", "directions4", "directions5"]}

task_list = json_message["task"]
directions_list = json_message["directions"]

for i in range(len(task_list)):
    # publish the task 
    combined_message = task_list[i] + "\n" + directions_list[i]

    client.publish(topic, combined_message)
    # publish the directions (if needed)
    #client.publish(topic, directions_list[i])
    time.sleep(5)