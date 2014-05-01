import sys
import re
import os

#Use this program to input a txt file of a hurricane track from http://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/Besttracks/bst2013.txt and convert to json 

fle = raw_input('Enter the name of the hurricane path you got from JMA \'Best Tracks\': ')

monthDict = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'June',7:'July',8:'Aug', 9:'Sept',10:'Oct',11:'Nov',12:'Dec'}

 
f = open(fle,"r")
out = "["
for line in f:

	month = "\"" +  monthDict[int(re.sub('^0','',line[2:4]))] +"\""
	day = int(re.sub('^0','',line[4:6]))
#	print(re.sub('^0','',line[8:9]))
	hour = int(re.sub('^0','',line[6:8]))
	lat = float(line[15:18])/10
	lon = float(line[19:23])/10
	h_class = int(line[13])
	w_spd = int(re.sub('^0','',line[33:36]))

	out += '{"month":%s,"day":%d, "hour":%d, "lat":%.1f, "lon":%.1f, "class": %d,"wspeed":%d },' %(
       month, day, hour, lat, lon, h_class, w_spd)
out = out[0:-1] + "]"
f.close()


wr = open(fle + ".json", 'w')
wr.write(out)
wr.close()

