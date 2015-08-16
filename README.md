# Overview
A simple integration (ok, maybe a little hacky) for [Wireless Sensor Tags](http://wirelesstag.net/) with the home automation server [OpenHab](http://openhab.org). As OpenHab doesn't have a binding for *Wireless Sensor Tags*, you can use the existing OpenHAB REST api coupled and it's ability to reference URL content to bring in sensor data (temperature or events).

## Temperature
If you've configured your *Tags* already, you'll have them setup and sending data to your personal mytaglist.com site. You can use this method to bind this data to an OpenHAB item.

### Get the CSV datafeed URL
Every Sensor Tag has the option to publish it's data as a CSV. Doing so makes this data **PUBLIC**, so while it's not likely someone is going to snoop on your sensor data, don't do this if the sensor data (temperature or humidity) is important to you! You'll need to enable the CSV publishing and get the web address via mytaglist.com

1. Login to your mytaglist.com account
2. Go to the sensor you'd like to configure
3. Click on the SHARE button and select *Temperature/Humidity* from the popup menu
4. Copy the CSV download link and check the *Anyone with link can access temperature data for this tag* box
5. Close by clicking the *Apply permissions* button

You should now have a link like:

http://www.mytaglist.com/ethDownloadMultiStatsCSV.aspx?uuids=abcdefgh-1234-5a67-86dd6fe8dbeb&type=temperature

Open it in your browser and you should get a downloaded file with your temperature data in a CSV file. You''ll need this path for the next step.

### Configure OpenHAB
In openhab.cfg, go to the *HTTP Binding* section and create a new cached HTTP Binding entry. It should look something like:

```
############################### HTTP Binding ##########################################
#
# timeout in milliseconds for the http requests (optional, defaults to 5000)
#http:timeout=

# the interval in milliseconds when to find new refresh candidates
# (optional, defaults to 1000)
#http:granularity=

# configuration of the first cache item
# http:<id1>.url=
# http:<id1>.updateInterval=

# configuration of the second cache item  
# http:<id2>.url=
# http:<id2>.updateInterval=


http:cachedTemperature.url=http://www.mytaglist.com/ethDownloadMultiStatsCSV.aspx?uuids=abcdefgh-1234-5a67-86dd6fe8dbeb&type=temperature
http:cachedTemperature.updateInterval=600000
```

Create a new item in your .items file of your choice. This uses OpenHAB's HTTP Binding you created in the openhab.cfg and links it to an item. The temperature value will now be pulled from the CSV file. Notice the `JS(wirelessTagTemp.js)` section. This is IMPORTANT. It tells OpenHAB to transform the return value through a javascript function. You can find the JS itself in this repo, make sure you copy it to your `Configurations/Transform` folder.
```
Number		Temperature_Living_Room		"Living Room [%.1f °C]"		<temperature>	(Groupname)		{ http="<[cachedTemperature:60000:JS(wirelessTagTemp.js)]" }

```

That should be all there is to it. Repeat the process for every sensor tag you want to setup.

## Events (motion etc)
The sensor data above is cached and can be delayed. This isn't satisfactory for event driven sensors, like motion detection or reed switches (door open/close etc). To handle these, we can again use mytaglist.com and setup an OpenHAB API call on event detection.

1. Login to mytaglist.com
2. Navigate to your sensor
3. Click the 'arrow' icon that shows the additional menu
4. Select 'URL Calling'
5. For motion tags, check the rows for when motion is detected / times out and enter the REST URL for your OpenHAB system / item. eg

```
http://openhab.local:8080/CMD?<your_item_name>=[ON|OFF]
```

eg.

* Motion detected: `http://openhab.local:8080/CMD?Motion_1=ON`
* Motion timed out: `http://openhab.local:8080/CMD?Motion_1=OFF`

If necessary, check the *This URL uses private IP address (Call from Tag Manager)* box if your Tag Manager and OpenHAB server are on the same private network (pretty likely).

Ensure you have a corresponding `Switch item` in your .items file. eg.
```
Switch  Motion_1 				"Living Room"		<present>		(Motion)
```

Once configured, you should see the Switch in OpenHAB toggle pretty simultaneously with mytaglist.com. 

## Summary

Using these methods, you should be able to weave Wireless Sensor Tags into your home automation system and no longer need to refer to the mytaglist.com interface. It would be somewhat nicer to use the [JSON Web Service API](http://wirelesstag.net/media/mytaglist.com/apidoc.html) for the sensor data, but that would require a more detailed binding which is beyond my basic Java skills. 

Hope you find this helpful.

