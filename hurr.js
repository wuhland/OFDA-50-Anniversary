<script type = "text/javascript">
 
			d3.json("data/" + d.id.toLowerCase() + "/track.json", function(error, track) {

					var color_scale = d3.scale.quantile().domain([3,5]).range(colorbrewer.Reds[5]);
					

					var dateText = svg.append("text")
						.attr("id", "dataTitle")
						.text("2013" + " " + track[0].month + " " + track[0].day + " " + track[0].hour + ":00 class: " + track[0].class)
						.attr("x", 650)
						.attr("y", 20)
						.attr("font-family", "sans-serif")
						.attr("font-size", "20px")
						.attr("fill", color_scale(track[0].class));

					var line = d3.svg.line()
						.interpolate("cardinal")
						.x(function(d) {return projection([d.lon, d.lat])[0]; })
						.y(function(d) {return projection([d.lon, d.lat])[1]; });

					var baseHurrPath = svg.append("path")
						.attr("d",line(track))
						.attr("fill","none")
						.attr("stroke","none")
						.attr("stroke-width",0)

					var hurrPathEl = baseHurrPath.node();
					var hurrPathElLen = hurrPathEl.getTotalLength();

					var pt = hurrPathEl.getPointAtLength(0);
					
					var path_g = g.append("g")
									.attr("id","hurr");

                    var icon_g = g.append("g")
                    	.attr("transform", "translate(" + pt.x + "," + pt.y + "), scale("+(.05*track[0].class)+")")
						.attr("id","icon");
					
					var icon_bg = icon_g.append("circle")
    					.attr("r",20)
    					.attr("fill", "#ffffff")
    					.attr("class","icon");

  					var icon = icon_g.append("path")
    					.attr("d","m 20,-42 c -21.61358,0.19629 -34.308391,10.76213 -41.46346,18.0657 -7.155097,7.3036 -11.451337,17.59059 -11.599112,26.13277 0,14.45439 9.037059,26.79801 21.767213,31.69368 -14.965519,10.64929 -25.578236,6.78076 -37.671451,7.85549 C -4.429787,54.20699 14.03,37.263 23.12144,28.41572 32.2133,19.56854 34.6802,10.79063 34.82941,2.19847 c 0,-14.45219 -9.03405,-26.79679 -21.76113,-31.69364 14.90401,-10.54656 25.48889,-6.69889 37.55061,-7.77104 C 38.78869,-40.57565 29.11666,-41.95733 21.03853,-42 20.68954,-42.0105 20.34303,-42.0105 20,-42 z M 0.82306,-7.46851 c 4.72694,0 8.56186,4.27392 8.56186,9.54602 0,5.2725 -3.83492,9.54651 -8.56186,9.54651 -4.726719,0 -8.555958,-4.27401 -8.555958,-9.54651 0,-5.2721 3.829239,-9.54602 8.555958,-9.54602 z")
    
    					.attr("fill", color_scale(track[0].class))
    					.attr("class","icon");

  					var i = 0;
  
  					var animation = setInterval(function(){
      					pt = hurrPathEl.getPointAtLength(hurrPathElLen*i/track.length);
      					icon_g
        					.transition()
        					.ease("linear")							
        					.duration(500) //changed from 1000
        					.attr("transform", "translate(" + pt.x + "," + pt.y + "), scale("+(0.05*track[i].class)+"), rotate("+(i*15)+")");
      					icon
        					.transition()
        					.ease("linear")
        					.duration(500)
        					.attr("fill", color_scale(track[i].class));

      					dateText
        					.text("2013" + " " + track[i].month + " " + track[i].day + " " + track[i].hour + ":00 class: " + track[i].class)
        					.attr("fill", color_scale(track[i].class));
						
      					//Draw the path, only when i > 0 in otder to have two points
      					if (i>0){
        					color0 = color_scale(track[i-1].class);
        					color1 = color_scale(track[i].class);

        					var activatedTrack = new Array();
        
        					activatedTrack.push(track[i-1]);
        					activatedTrack.push(track[i]);

        					var color = d3.interpolateLab(color0, color1);
        					path_g.selectAll("path"+i)
        					.data(quad(sample(line(activatedTrack), 1)))
        					.enter().append("path")
          						.style("fill", function(d) { return color(d.t);})
          						.style("stroke", function(d) { return color(d.t); })
          						.attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], trackWidth); });
      					}
					      	i = i + 1;
          					if (i==track.length)
            					clearInterval(animation)
  					},500);
				path_xyz = get_xyz(path_g);

				});
			
			
				// Sample the SVG path string "d" uniformly with the specified precision.
				function sample(d, precision) {
  					var path = document.createElementNS(d3.ns.prefix.svg, "path");
  					path.setAttribute("d", d);

  					var n = path.getTotalLength(), t = [0], i = 0, dt = precision;
  					while ((i += dt) < n) t.push(i);
  					t.push(n);

  					return t.map(function(t) {
    					var p = path.getPointAtLength(t), a = [p.x, p.y];
    					a.t = t / n;
    					return a;
  					});
				}

				// Compute quads of adjacent points [p0, p1, p2, p3].
				function quad(points) {
  					return d3.range(points.length - 1).map(function(i) {
    					var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
    					a.t = (points[i].t + points[i + 1].t) / 2;
    					return a;
 				 	});
				}

				// Compute stroke outline for segment p12.
				function lineJoin(p0, p1, p2, p3, width) {
  					var u12 = perp(p1, p2),
      					r = width / 2,
      					a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
      					b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
      					c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
      					d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

  					if (p0) { // clip ad and dc using average of u01 and u12
    					var u01 = perp(p0, p1), e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
    					a = lineIntersect(p1, e, a, b);
    					d = lineIntersect(p1, e, d, c);
  					}

					if (p3) { // clip ab and dc using average of u12 and u23
    					var u23 = perp(p2, p3), e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
    						b = lineIntersect(p2, e, a, b);
    						c = lineIntersect(p2, e, d, c);
  					}

  					return "M" + a + "L" + b + " " + c + " " + d + "Z";
					}

				// Compute intersection of two infinite lines ab and cd.
				function lineIntersect(a, b, c, d) {
  					var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3,
      					y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3,
      					ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
  					return [x1 + ua * x21, y1 + ua * y21];
				}

				// Compute unit vector perpendicular to p01.
				function perp(p0, p1) {
  					var u01x = p0[1] - p1[1], u01y = p1[0] - p0[0],
      					u01d = Math.sqrt(u01x * u01x + u01y * u01y);
  					return [u01x / u01d, u01y / u01d];
				}	



</script>
