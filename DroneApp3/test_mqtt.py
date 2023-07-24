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
topic = topic_tasks
connected = False 

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


tasks_array = ["Raise Throttle", "task2", "task3", "task4", "task5"]

# using a for loop
for task in tasks_array:
    print('publishing')
    task_json = json.dumps(task)
    client.publish(topic, task_json.strip('\"'))
    time.sleep(5)
    

