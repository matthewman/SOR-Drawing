//timan
//Man Ting-Chun Matthew
//CMPS160
//Prog3
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform float u_ObjNo;\n' + // Indicate the obj
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  if (u_ObjNo>=0.0) {\n' + //  Draw in blue if mouse is pressed
  '    v_Color = vec4(a_Color.r, a_Color.g, a_Color.b, u_ObjNo/255.0);\n' +
  '  } else {\n' +
  '    v_Color = vec4(a_Color.r, a_Color.g, a_Color.b, a_Color.a);\n' +
  '  }\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

//Custom class for objects
function obj_class(coordinates,colors,indices,vertices,obj_num,scales,trans,rotates){
  this.x_y_z_coordinates=coordinates;
  this.f_colors=colors;
  this.pos_indices=indices;
  this.num_vertices=vertices;
  this.obj_num=obj_num;
  this.scaled = scales;
  this.translated = trans;
  this.rotated = rotates;
}

function scaling(obj_arr,obj_clicked){
  if (scale>2)
    scale=2;
  else if (scale<0.5)
    scale=0.5;
  obj_arr[obj_clicked].scaled = obj_arr[obj_clicked].scaled * scale;
}

function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('canvasElement');
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  f_colors[0]=new Array();
  x_y_z_coordinates[0]=new Array();
  // Set the vertex coordinates and color
  var n = initVertexBuffers(gl,line_index,f_colors[0],x_y_z_coordinates[0],a_Position);
    if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
    }

  // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Disable the right click context menu on the canvas
  canvas.addEventListener('contextmenu', function(e){
    if(e.button == 2){
      e.preventDefault();
      return false;
    }
  },  false);

  if (canvas.addEventListener) {
    canvas.addEventListener("mousewheel", MouseWheelHandler, false);
    canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
  }
  else canvas.attachEvent("onmousewheel", MouseWheelHandler);
  


  // Specify the color for clearing <canvas> as white
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);

  u_ObjNo = gl.getUniformLocation(gl.program, 'u_ObjNo');
  if (!u_ObjNo) { 
    console.log('Failed to get the storage location of uniform variable');
    return;
  }

  gl.uniform1f(u_ObjNo, -1.0); // Pass default to u_ObjNo

  // Get the storage location of u_MvpMatrix
  // Get the storage locations of uniform variables and so on
  u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) { 
    console.log('Failed to get the storage location of u_ViewMatrix and/or u_ProjMatrix');
    return;
  }

  // Set the eye point and the viewing volume
  mvpMatrix = new Matrix4();
  mvpMatrix.setLookAt(camera_x, camera_y, camera_z,lookat_x, lookat_y, lookat_z, 0, 1000, 0);
  mvpMatrix.setOrtho(-500,500,-500,500,-500,500);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position); };
  // Register function (event handler) to be called on a mouse move
  canvas.onmousemove = function(ev){ moving(ev, gl, canvas, a_Position); };
  // Register function (event handler) to be called on a mouse right-click
  canvas.oncontextmenu = function(ev){ rclick(ev,gl,canvas,a_Position); };

  canvas.onmouseup = function(ev){ release(ev, gl, canvas, a_Position); };
  //add onclick functions to the buttons
  document.getElementById("new").onclick = function(){new_btn(gl,a_Position)};
  document.getElementById("extract").onclick = function(){updateScreen(gl,a_Position)};
  document.getElementById("toggle").onclick = function(){changeToggle(gl,a_Position)};
  document.getElementById("shade_toggle").onclick = function(){changeSToggle(gl,a_Position)};
  document.getElementById("amb_toggle").onclick = function(){change_amb(gl,a_Position)};
  document.getElementById("spec_toggle").onclick = function(){change_spec(gl,a_Position)};
  document.getElementById("per_toggle").onclick = function(){change_per(gl,a_Position)};
  document.getElementById("change_g").onclick = function(){change_glossiness(gl,a_Position)};
  document.getElementById("gloss").value = "1"; //set default slider value to 1
  //initialize the 2D-array for storing the vertices coordinates
  for (var i=0;i<37;i++){
    x_y_z_coordinates[i]=new Array();
    f_colors[i]=new Array();
    v_normals[i]=new Array();
    s_normals[i]=new Array();
  }
    
  //draw a line in the middle of the canvas to seperate left right
  //draw_mid_line(gl,a_Position);

  setupIOSOR("fileinput");

  function MouseWheelHandler(e) {
    if (clicked==false && perspective==true && middle_clicked==false){  //zoom in or out (for perspective view only)
      var e = window.event || e;
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      fov = fov+delta;
      if (fov<0){
        fov=0;
      }
      output_all(gl,a_Position);
      return;
    }
    if (clicked==true){   //scaling on selected object
      var e = window.event || e;
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      scale += delta/5.00;
      return false;
    }
    if(middle_clicked){   //move camera in or out when middle click and wheel
      var e = window.event || e;
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      camera_z+=delta*50;
      lookat_z+=delta*50;
      output_all(gl,a_Position);
    }
  }

}

function output_all(gl,a_Position){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if(perspective){    //for perspective view, we use setLookAt and setPerspective
    var viewMatrix = new Matrix4();  // View matrix
    var projMatrix = new Matrix4();  // Projection matrix
    viewMatrix.setLookAt(camera_x, camera_y, camera_z, lookat_x, lookat_y, lookat_z, 0, 1000, 0);
    projMatrix.setPerspective(fov, canvas.width/canvas.height, 1, 2000);
    mvpMatrix.set(projMatrix).multiply(viewMatrix);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  }
  else{             //for orthographic view, we use setLookAt and setOrtho
    var projMatrix = new Matrix4();
    var viewMatrix = new Matrix4();  // View matrix
    mvpMatrix = new Matrix4();
    mvpMatrix.setOrtho(-500+camera_x,500+camera_x,-500+camera_y,500+camera_y,lookat_z,camera_z);
    viewMatrix.setLookAt(camera_x, camera_y, camera_z, lookat_x, lookat_y, lookat_z, 0, 1000, 0);
    mvpMatrix.multiply(viewMatrix);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  }
  draw_light_source_1(gl,a_Position);
  draw_light_source_2(gl,a_Position);

  for (var i=0;i<num_obj;i++){
    if(obj_clicked==i){
      var tmp_col1=og_col;
      var tmp_col2=new_col;
      if(og_col[0]!=0){
        og_col=[0.2,0.2,0.2];
      }
      if(new_col[0]!=0){
        new_col = [0.2,0.2,0.2];
      }
      draw_obj(gl,a_Position,obj_arr[i]);
      og_col=tmp_col1;
      new_col = tmp_col2;
    }
    else{
      draw_obj(gl,a_Position,obj_arr[i]);
    }
  }
}

function check_obj(gl, x, y, u_ObjNo, a_Position,obj_n) {   //to check whether the object is clicked
  var picked = false;
  gl.uniform1f(u_ObjNo, (253-obj_n));  // Pass obj number to u_ObjNo
  draw_obj(gl,a_Position,obj_arr[obj_n]);
  // Read pixel at the clicked position
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (pixels[3] == (253-obj_n)){ // The mouse in on cube if R(pixels[2]) is 255
    picked = true;
  }
  gl.uniform1f(u_ObjNo, -1.0);  // Pass -1 to u_ObjNo(rewrite the cube)

  draw_obj(gl,a_Position,obj_arr[obj_n]);

  return picked;
}

function check1(gl, x, y, u_ObjNo, a_Position) {    //to check whether light source 1 is clicked
  var picked = false;
  gl.uniform1f(u_ObjNo, 255);  // Pass 255 to u_ObjNo
  draw_light_source_1(gl,a_Position);
  // Read pixel at the clicked position
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (pixels[3] == 255){ // The mouse in on cube if R(pixels[2]) is 255
    picked = true;
  }
  gl.uniform1f(u_ObjNo, -1.0);  // Pass false to u_ObjNo(rewrite the cube)
  draw_light_source_1(gl,a_Position);

  return picked;
}

function check2(gl, x, y, u_ObjNo, a_Position) {    //to check whether light source 2 is clicked
  var picked = false;
  gl.uniform1f(u_ObjNo, 254);  // Pass true to u_ObjNo
  draw_light_source_2(gl,a_Position);
  // Read pixel at the clicked position
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  if (pixels[3] == 254){ // The mouse in on cube if R(pixels[2]) is 255
    picked = true;
  }
  gl.uniform1f(u_ObjNo, -1.0);  // Pass false to u_ObjNo(rewrite the cube)
  draw_light_source_2(gl,a_Position);

  return picked;
}

function change_per(gl,a_Position){
  if(perspective==false){
    perspective=true;
  }
  else{
    perspective = false;
  }
  if(ended){
    output_all(gl,a_Position);
  }
}

function change_amb(gl,a_Position){
  if(amb==false){
    ambient = [1*0,1*0,1*0.2];
    amb=true;
  }
  else{
    ambient = [0,0,0];
    amb = false;
  }
  if(ended){
    output_all(gl,a_Position);
  }
}

function change_spec(gl,a_Position){
  if(specular==false){
    specular=true;
  }
  else{
    specular=false;
  }
  if(ended){
    output_all(gl,a_Position);
  }
}

function changeSToggle(gl,a_Position){
  if(smooth==false){
    smooth=true;
  }
  else{
    smooth=false;
  }
  if(ended){
    output_all(gl,a_Position);
  }
}

function changeToggle(gl,a_Position){
  if(toggle_checked==false){
    toggle_checked=true;
  }
  else{
    toggle_checked=false;
  }
  if(ended){
    output_all(gl,a_Position);
  }
}

//function for drawing a line in the middle of the canvas
function draw_mid_line(gl,a_Position){
  mid_line=new Array();
  gl.lineWidth(1);
  var mid_index=[0,1];
  var mid_colors=[0,0,0,0,0,0];
  mid_line.push(0);
  mid_line.push(1);
  mid_line.push(0);
  mid_line.push(0);
  mid_line.push(-1);
  mid_line.push(0);
  var n = initVertexBuffers(gl,mid_index,mid_colors,mid_line,a_Position);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  //Draw lines
  gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
}

function draw_light_source_1(gl,a_Position){
  mid_line=new Array();
  gl.lineWidth(5);
  var line_index=[0,1];
  mid_line.push(0);
  mid_line.push(0);
  mid_line.push(0);
  mid_line.push(500);
  mid_line.push(500);
  mid_line.push(500);
  var n = initVertexBuffers(gl,line_index,line_colors,mid_line,a_Position);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  //Draw lines
  gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
}

function draw_light_source_2(gl,a_Position){
    var c_vertices = new Float32Array([
     25, 525, 25,  -25, 525, 25,  -25, 475, 25,   25,475, 25, // v0-v1-v2-v3 front
     25, 525, 25,   25, 475, 25,   25, 475,-25,   25, 525,-25, // v0-v3-v4-v5 right
     25, 525, 25,   25, 525,-25,  -25, 525,-25,  -25, 525, 25, // v0-v5-v6-v1 up
    -25, 475, 25,  -25, 525,-25,  -25,475,-25,  -25,475, 25, // v1-v6-v7-v2 left
    -25,475,-25,   25,475,-25,   25, 475, 25,  -25,475, 25, // v7-v4-v3-v2 down
     25,475,-25,  -25,475,-25,  -25, 525,-25,   25, 525,-25  // v4-v7-v6-v5 back
  ]);
  // Colors
  var c_colors = new Array();
  for(var k=0;k<24;k++){
    c_colors.push(new_source_col[0]);
    c_colors.push(new_source_col[1]);
    c_colors.push(new_source_col[2]);
  }

  // Indices of the vertices
  var c_indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);
  var n = initVertexBuffers(gl,c_indices,c_colors,c_vertices,a_Position);
    if (n < 0) {
      console.log('Failed to set the vertex information');
    }
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

//Global variables
var x_y_z_coordinates = new Array(37); //The array for storing the x,y,z coordinates in one-dimensional array, 
//used for passing into the initVertexBuffer function

var num_vertices = 0; //count the number of vertices
var vertex_cal=0; //this is the value for keep track of the index values
var prev_x_coordinate = 0; //The x-coordinate of the last clicked point
var prev_y_coordinate = 0; //The y-coordinate of the last clicked point
var prev_z_coordinate = 0; //The z-coordinate of the last clicked point
var pos_indices = []; //the array to store the index values
var normal_array = [];
var mid_line = [];  //array for storing coordinates of the line in the middle
var ended = false;  //to check if the drawing has ended or not
var toggle_checked=false;
var f_colors = new Array(37);
var line_index = [];	//for drawing lines
var ambient = [0,0,0];	//the given ambient lighting
var smooth = false;		//indicate whether to use smooth shading or not
var specular = false; 	//indicate whether to use specular lighting or not
var g_factor = 1;		//the glossiness factor g for specular lighting, default set to 1
var amb = false;		//indicate whether to use ambient lighting or not
var s_normals = new Array(37);
var v_normals = new Array(37);
var og_light = [500,500,500]; //position of light from original light source
var og_col = [1,1,1];  //color of light from original light source
var new_light = [0,500,0]; //position of light from new light source
var new_col = [1,1,0];  //color of light from new light source
var new_source_col = [1,1,0]; //color for the cube
var line_colors=[1,0,0,1,0,0]; 
var switch1 = true;
var switch2 = true;
var mvpMatrix;
var u_MvpMatrix;
var canvas;
var perspective = false;
var u_ObjNo;
var num_obj=0; //initialize number of objects to be 0;
var obj_arr = new Array();
var clicked=false;  //initialize to false since no object is clicked
var obj_clicked= -1; //to know which object is being clicked
var scale = 1; //value for scaling
var clicked_x;    //position of x position clicked
var clicked_y;    //position of y position clicked
var clicked_z;    //position of z position clicked
var trans = [0,0,0];  //store the tranlation of the object
var rotates = [0,0];//along z-axis and along y-axis
var fov=100;      //initilize the fov of perspective view to 100
var camera_x=0;   //initialize camera position x at 0
var camera_y=0;   //initialize camera position y at 0
var camera_z=500; //initialize camera position z at 500
var lookat_x=0;   //initialize lookat position x at 0
var lookat_y=0;   //initialize lookat position y at 0
var lookat_z=-500;  //initialize lookat position z at -500
var middle_clicked=false; //check if clicked with middle mouse

//functions to calculate vertices coordinates after the 10 degree rotation
function x_multiplier(x,y,z){
  return (x*Math.cos(Math.PI/18) + z*Math.sin(Math.PI/18));
}
function y_multiplier(x,y,z){
  return y;
}
function z_multiplier(x,y,z){
  return (-x*Math.sin(Math.PI/18) + z*Math.cos(Math.PI/18));
}

function release(ev, gl, canvas, a_Position){   //function when mouse release is detected
  if(ended==false){
    return;
  }
  if(clicked && (ev.button == 0 || ev.button == 1)){    //left or middle click release so it is traslation
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect() ;
    var x_in_canvas = x - rect.left;
    var y_in_canvas = rect.bottom - y;
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2); 
    var z = y;
    var x_change = 0;
    var y_change = 0;
    var z_change = 0;    
    if(ev.button==1){
      z_change = z - clicked_z;
    }
    else if(clicked_x!=x || clicked_y!=y){
      x_change = x - clicked_x;
      y_change = y - clicked_y;
    }
    obj_arr[obj_clicked].translated[0]+=x_change*500;
    obj_arr[obj_clicked].translated[1]+=y_change*500;
    obj_arr[obj_clicked].translated[2]+=z_change*500;
    output_all(gl,a_Position);
  }
  else if(clicked && ev.button == 2){   //right click release so it is rotation
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect() ;
    var x_in_canvas = x - rect.left;
    var y_in_canvas = rect.bottom - y;
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    var x_change = 0;
    var y_change = 0;
    x_change = x - clicked_x;
    y_change = y - clicked_y;
    rotation(x_change,y_change);
    output_all(gl,a_Position);
  }
  else if(clicked==false && ev.button == 0){  //left click on background moves camera
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect() ;
    var x_in_canvas = x - rect.left;
    var y_in_canvas = rect.bottom - y;
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2); 
    var z = y;
    var x_change = 0;
    var y_change = 0;
    x_change = x - clicked_x;
    y_change = y - clicked_y;
    camera_x+=x_change*500;
    camera_y+=y_change*500;
    lookat_x+=x_change*500;
    lookat_y+=y_change*500;
    output_all(gl,a_Position);
  }
  if(clicked==false && middle_clicked==true){  //middle click on the background is released
    middle_clicked=false;
  }
}

function rotation(x_change,y_change){   //do the rotation
  if(Math.abs(x_change)>Math.abs(y_change)){  //if the x translation of mouse > y translation , we do a rotation in z axis, else x axis
    obj_arr[obj_clicked].rotated[0] += x_change;
  }
  else{
    obj_arr[obj_clicked].rotated[1] += y_change;
  }
}

function x_rotate_z_axis(x,y,z,x_change){
  return (x*Math.cos(2*Math.PI*x_change) - y*Math.sin(2*Math.PI*x_change));
}

function y_rotate_z_axis(x,y,z,x_change){
  return (x*Math.sin(2*Math.PI*x_change) + y*Math.cos(2*Math.PI*x_change));
}

function y_rotate_x_axis(x,y,z,y_change){
  return (y*Math.cos(2*Math.PI*y_change) - z*Math.sin(2*Math.PI*y_change));
}

function z_rotate_x_axis(x,y,z,y_change){
  return (y*Math.sin(2*Math.PI*y_change) + z*Math.cos(2*Math.PI*y_change));
}

//Function for mouse click action
function click(ev, gl, canvas, a_Position) {
  if(ended==true){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect() ;
    var x_in_canvas = x - rect.left;
    var y_in_canvas = rect.bottom - y;
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);    
    clicked_x = x;
    clicked_y = y;
    clicked_z = y;
    if(check1(gl, x_in_canvas, y_in_canvas, u_ObjNo, a_Position)) {   //if light source 1 is clicked
      if(switch1){
        og_col=[0,0,0];
        line_colors=[0.2,0.2,0.2,0.2,0.2,0.2];
        switch1=false;
      }
      else{
        og_col=[1,1,1];
        line_colors=[1,0,0,1,0,0];
        switch1=true;
      }
    }
    if(check2(gl, x_in_canvas, y_in_canvas, u_ObjNo, a_Position)){    //if light source 2 is clicked
      if(switch2){
        new_col = [0,0,0];
        new_source_col=[0.2,0.2,0.2];
        switch2=false;
      }
      else{
        new_col = [1,1,0];
        new_source_col=[1,1,0];
        switch2=true;
      }
    }
    var clicked_empty=true;   //to indicate whether it is a click on background following a click on object
    for (var i=0;i<num_obj;i++){  //check for each object whether it is clicked, only register the last object 
      if(check_obj(gl, x_in_canvas, y_in_canvas, u_ObjNo, a_Position,i)){
        clicked_empty=false;
        clicked=true;
        obj_clicked= i;
      }
    }
    if(clicked_empty==true && clicked==true){   //true when the click on background is after a click on object
      scaling(obj_arr,obj_clicked);
      clicked=false;
      obj_clicked= -1;
      scale=1;
    }
    if(clicked_empty==true && ev.button==1){    //true when the click is on background and it is a middle click
      middle_clicked=true;
    }
    output_all(gl,a_Position);
    return;
  }
  //add index values for each click
  pos_indices.push(vertex_cal);
  pos_indices.push(vertex_cal+1);
  pos_indices.push(vertex_cal+2);
  pos_indices.push(vertex_cal);
  pos_indices.push(vertex_cal+2);
  pos_indices.push(vertex_cal+3);
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var z = 0; // z coordinate for clicks are 0 in 2D plane
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  line_index.push(num_vertices);
  //pushing the coordinates into the 2D array
  x_y_z_coordinates[0].push(x*500);
  x_y_z_coordinates[0].push(y*500);
  x_y_z_coordinates[0].push(z*500);
  f_colors[0].push(1);
  f_colors[0].push(0);
  f_colors[0].push(0);
  for(var i=1;i<37;i++){ 
    x_y_z_coordinates[i].push(x_multiplier(x_y_z_coordinates[i-1][num_vertices*3],x_y_z_coordinates[i-1][num_vertices*3+1],x_y_z_coordinates[i-1][num_vertices*3+2]));
    x_y_z_coordinates[i].push(y_multiplier(x_y_z_coordinates[i-1][num_vertices*3],x_y_z_coordinates[i-1][num_vertices*3+1],x_y_z_coordinates[i-1][num_vertices*3+2]));
    x_y_z_coordinates[i].push(z_multiplier(x_y_z_coordinates[i-1][num_vertices*3],x_y_z_coordinates[i-1][num_vertices*3+1],x_y_z_coordinates[i-1][num_vertices*3+2]));
    f_colors[i].push(1);
    f_colors[i].push(0);
    f_colors[i].push(0);
  }

  //update the values for vertices and indices
  num_vertices++;
  vertex_cal+=4;

  //Save down the last position so as to make rubberband line
  prev_x_coordinate=x*500;
  prev_y_coordinate=y*500;
  prev_z_coordinate=z*500;

  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  //drawing the polyline for all clicks
  var n = initVertexBuffers(gl,line_index,f_colors[0],x_y_z_coordinates[0],a_Position);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  //Draw lines
  gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
  //draw_mid_line(gl,a_Position);
}

//Initalize the vertex buffer for drawing
function initVertexBuffers(gl,index,col,coordinates,a_Position) {
  var vertices = new Float32Array(coordinates);
  var colors = new Float32Array(col);
  var indices = new Uint8Array(index);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}


function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

//Function for mouse move action
function moving(ev,gl,canvas,a_Position){
  if(ended==true){
    return;
  }
  var x = ev.clientX;
  var y = ev.clientY;
  var z = 0;
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  x= x*500;
  y= y*500;
  var rubberline_index = [0,1];

  var rubberband_coordinates = []; //To store values for drawing the rubberband line
  var rubberband_colors = [];
  rubberband_coordinates.push(prev_x_coordinate);
  rubberband_coordinates.push(prev_y_coordinate);
  rubberband_coordinates.push(prev_z_coordinate);
  rubberband_colors.push(1);
  rubberband_colors.push(0);
  rubberband_colors.push(0);
  rubberband_coordinates.push(x);
  rubberband_coordinates.push(y);
  rubberband_coordinates.push(z);
  rubberband_colors.push(1);
  rubberband_colors.push(0);
  rubberband_colors.push(0);
  //draw the rubber band line if there are more than one clicked points
  if (x_y_z_coordinates[0].length>0){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  	var m = initVertexBuffers(gl,rubberline_index,rubberband_colors,rubberband_coordinates,a_Position);
    if (m < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }
    gl.drawElements(gl.LINE_STRIP, m, gl.UNSIGNED_BYTE, 0);

  	var n = initVertexBuffers(gl,line_index,f_colors[0],x_y_z_coordinates[0],a_Position);
    if (n < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }
    //Draw lines
    gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
    //draw_mid_line(gl,a_Position);
  }
}

//function for right click action
function rclick(ev, gl, canvas, a_Position){
  if(ended==true){
    return;
  }
  var tmp_obj = new obj_class(x_y_z_coordinates,f_colors,pos_indices,num_vertices,num_obj,1,trans,rotates);
  obj_arr.push(tmp_obj);
  num_obj++;
  output_all(gl,a_Position);
}

//function for drawing the object in the global variables x_y_z_coordinates and pos_indices
//during drawing, the ambient lighting and specular lighting are added to the color value of the vertices and faces
function draw_obj(gl,a_Position,obj){
  var d_to_center = find_center(obj);

  var new_arr = [];
  var f_col = [];
  var s_col = [];
  var new_nor = [];
  var temp_col = [];  
  s_normals = new Array(37);
  v_normals = new Array(37);
  var prev_col = new Array(37);
  for (var i=0;i<37;i++){
    v_normals[i] = new Array(obj.num_vertices+1);
  	prev_col[i] = new Array(obj.num_vertices+1);
    s_normals[i] = new Array(obj.num_vertices+1);
  	for (var j=0;j<obj.num_vertices+1;j++){
  		prev_col[i][j] = new Array();
      v_normals[i][j] = new Array();
      s_normals[i][j] = new Array();
  	}
  }
  for (var i=0;i<36;i++){
    for (var j=0;j<obj.num_vertices;j++){
      var poly_arr=[];
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      var v = new Array(8);

      v[0]=[(poly_arr[9]-poly_arr[0]),(poly_arr[10]-poly_arr[1]),(poly_arr[11]-poly_arr[2])];
      v[1]=[(poly_arr[3]-poly_arr[0]),(poly_arr[4]-poly_arr[1]),(poly_arr[5]-poly_arr[2])];
      s_normals[i][j]=normalize(cross_product(v[0],v[1]));
    }
  }
  for (var i=0;i<37;i++){
    for (var j=0;j<obj.num_vertices;j++){
      if(i==0){
        if(j==0){
          v_normals[i][j]=normalize([s_normals[i][j][0]+s_normals[35][j][0],s_normals[i][j][1]+s_normals[35][j][1],s_normals[i][j][2]+s_normals[35][j][1]]);
        }
        else if(j==obj.num_vertices-1){
          v_normals[i][j]=normalize([s_normals[i][j-1][0]+s_normals[35][j-1][0],s_normals[i][j-1][1]+s_normals[35][j-1][1],s_normals[i][j-1][2]+s_normals[35][j-1][1]]);
        }
        else{
          v_normals[i][j]=normalize([s_normals[i][j][0]+s_normals[35][j][0]+s_normals[i][j-1][0]+s_normals[35][j-1][0],s_normals[i][j][1]+s_normals[35][j][1]+s_normals[i][j-1][1]+s_normals[35][j-1][1],s_normals[i][j][2]+s_normals[35][j][2]+s_normals[i][j-1][2]+s_normals[35][j-1][2]]);
        }
      }
      else if(i==36){
        if(j==0){
          v_normals[i][j]=v_normals[0][0];
        }
        else if(j==obj.num_vertices-1){
          v_normals[i][j]=v_normals[0][j];
        }
        else{
          v_normals[i][j]=v_normals[0][j];
        }
      }
      else{
        if(j==0){
          v_normals[i][j]=normalize([s_normals[i][j][0]+s_normals[i-1][j][0],s_normals[i][j][1]+s_normals[i-1][j][1],s_normals[i][j][2]+s_normals[i-1][j][1]]);
        }
        else if(j==obj.num_vertices-1){
          v_normals[i][j]=normalize([s_normals[i][j-1][0]+s_normals[i-1][j-1][0],s_normals[i][j-1][1]+s_normals[i-1][j-1][1],s_normals[i][j-1][2]+s_normals[i-1][j-1][1]]);
        }
        else{
          v_normals[i][j]=normalize([s_normals[i][j][0]+s_normals[i-1][j][0]+s_normals[i][j-1][0]+s_normals[i-1][j-1][0],s_normals[i][j][1]+s_normals[i-1][j][1]+s_normals[i][j-1][1]+s_normals[i-1][j-1][1],s_normals[i][j][2]+s_normals[i-1][j][2]+s_normals[i][j-1][2]+s_normals[i-1][j-1][2]]);
        }
      }
    }
  }


  //draw all the surfaces between every two vertical lines
  for (var i=0;i<36;i++){
    new_arr=[];
    f_col=[];
    new_nor=[];
    temp_col=[];
    s_col=[];
    for (var j=0;j<obj.num_vertices;j++){
      var poly_arr=[];
      for (var k=0;k<3;k++){
          // poly_arr.push((obj.x_y_z_coordinates)[i][k+j*3]*obj.scaled);
          // new_arr.push((obj.x_y_z_coordinates)[i][k+j*3]*obj.scaled);
          temp_col.push((obj.f_colors)[i][k+j*3]);
      }
      for (var k=0;k<3;k++){
          // poly_arr.push((obj.x_y_z_coordinates)[i+1][k+j*3]*obj.scaled);
          // new_arr.push((obj.x_y_z_coordinates)[i+1][k+j*3]*obj.scaled);
          temp_col.push((obj.f_colors)[i+1][k+j*3]);
      }
      for (var k=0;k<3;k++){
          // poly_arr.push((obj.x_y_z_coordinates)[i+1][k+3+j*3]*obj.scaled);
          // new_arr.push((obj.x_y_z_coordinates)[i+1][k+3+j*3]*obj.scaled);
          temp_col.push((obj.f_colors)[i+1][k+3+j*3]);  
      }
      for (var k=0;k<3;k++){
          // poly_arr.push((obj.x_y_z_coordinates)[i][k+3+j*3]*obj.scaled);
          // new_arr.push((obj.x_y_z_coordinates)[i][k+3+j*3]*obj.scaled);
          temp_col.push((obj.f_colors)[i][k+3+j*3]);
      }
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      poly_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      poly_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      new_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      new_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      new_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      new_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      new_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      var v = new Array(2);

      v[0]=[(poly_arr[9]-poly_arr[0]),(poly_arr[10]-poly_arr[1]),(poly_arr[11]-poly_arr[2])];
      v[1]=[(poly_arr[3]-poly_arr[0]),(poly_arr[4]-poly_arr[1]),(poly_arr[5]-poly_arr[2])];
      product_v01=cross_product(v[0],v[1]);

      var midx=(poly_arr[0]+poly_arr[3]+poly_arr[6]+poly_arr[9])/4;
      var midy=(poly_arr[1]+poly_arr[4]+poly_arr[7]+poly_arr[10])/4;
      var midz=(poly_arr[2]+poly_arr[5]+poly_arr[8]+poly_arr[11])/4;
      var product_f=[(s_normals[i][j][0]),(s_normals[i][j][1]),(s_normals[i][j][2])];
      var np = normalize(product_f);
      var cos_angle=Math.max(0,find_cos([1,1,1],np));

      var new_source = Math.max(find_cos(new_light,np),0);
      var new_diffuse = [new_col[0]*1*new_source,new_col[1]*0*new_source,new_col[2]*0*new_source];
      var og_diffuse = [og_col[0]*1*cos_angle,og_col[1]*0*cos_angle,og_col[2]*0*cos_angle];
      var n_s_lighting = new Array(4);
      n_s_lighting[0] = spec([v_normals[i][j][0]+midx,v_normals[i][j][1]+midy,v_normals[i][j][2]+midz],[new_light[0]+midx,new_light[1]+midy,new_light[2]+midz],new_col);
      n_s_lighting[1] = spec([v_normals[i+1][j][0]+midx,v_normals[i+1][j][1]+midy,v_normals[i+1][j][2]+midz],[new_light[0]+midx,new_light[1]+midy,new_light[2]+midz],new_col);
      n_s_lighting[2] = spec([v_normals[i+1][j+1][0]+midx,v_normals[i+1][j+1][1]+midy,v_normals[i+1][j+1][2]+midz],[new_light[0]+midx,new_light[1]+midy,new_light[2]+midz],new_col);
      n_s_lighting[3] = spec([v_normals[i][j+1][0]+midx,v_normals[i][j+1][1]+midy,v_normals[i][j+1][2]+midz],[new_light[0]+midx,new_light[1]+midy,new_light[2]+midz],new_col);
      n_f_s_lighting = [(n_s_lighting[0][0]+n_s_lighting[1][0]+n_s_lighting[2][0]+n_s_lighting[3][0])/4,(n_s_lighting[0][1]+n_s_lighting[1][1]+n_s_lighting[2][1]+n_s_lighting[3][1])/4,(n_s_lighting[0][2]+n_s_lighting[1][2]+n_s_lighting[2][2]+n_s_lighting[3][2])/4];

      var f_s_lighting;
      var s_s_lighting = new Array(4)
      s_s_lighting[0] = spec([v_normals[i][j][0],v_normals[i][j][1],v_normals[i][j][2]],og_light,og_col);
      s_s_lighting[1] = spec([v_normals[i+1][j][0],v_normals[i+1][j][1],v_normals[i+1][j][2]],og_light,og_col);
      s_s_lighting[2] = spec([v_normals[i+1][j+1][0],v_normals[i+1][j+1][1],v_normals[i+1][j+1][2]],og_light,og_col);
      s_s_lighting[3] = spec([v_normals[i][j+1][0],v_normals[i][j+1][1],v_normals[i][j+1][2]],og_light,og_col);
      f_s_lighting = [(s_s_lighting[0][0]+s_s_lighting[1][0]+s_s_lighting[2][0]+s_s_lighting[3][0])/4,(s_s_lighting[0][1]+s_s_lighting[1][1]+s_s_lighting[2][1]+s_s_lighting[3][1])/4,(s_s_lighting[0][2]+s_s_lighting[1][2]+s_s_lighting[2][2]+s_s_lighting[3][2])/4];

      if(i==0){
      	if(j==0){
      		for (var k=0;k<4;k++){
        		s_col.push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[k][0]+new_diffuse[0]+n_s_lighting[k][0]));
        		s_col.push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[k][1]+new_diffuse[1]+n_s_lighting[k][1]));
        		s_col.push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[k][2]+new_diffuse[2]+n_s_lighting[k][2]));
        	}
          //setting color for first 4 vertex
        	prev_col[0][0].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[0][0]+new_diffuse[0]+n_s_lighting[0][0]));
        	prev_col[0][0].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[0][1]+new_diffuse[1]+n_s_lighting[0][1]));
        	prev_col[0][0].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[0][2]+new_diffuse[2]+n_s_lighting[0][2]));
          prev_col[1][0].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[1][0]+new_diffuse[0]+n_s_lighting[1][0]));
          prev_col[1][0].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[1][1]+new_diffuse[1]+n_s_lighting[1][1]));
          prev_col[1][0].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[1][2]+new_diffuse[2]+n_s_lighting[1][2]));
          prev_col[1][1].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[2][0]+new_diffuse[0]+n_s_lighting[2][0]));
          prev_col[1][1].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[2][1]+new_diffuse[1]+n_s_lighting[2][1]));
          prev_col[1][1].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[2][2]+new_diffuse[2]+n_s_lighting[2][2]));
          prev_col[0][1].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[3][0]+new_diffuse[0]+n_s_lighting[3][0]));
          prev_col[0][1].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[3][1]+new_diffuse[1]+n_s_lighting[3][1]));
          prev_col[0][1].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[3][2]+new_diffuse[2]+n_s_lighting[3][2]));
      	}
      	else{
      		for (var k=0;k<2;k++){									//color for vertex already exist for upper two vertices of a polygon
      			s_col.push(prev_col[k][j][0]);
      			s_col.push(prev_col[k][j][1]);
      			s_col.push(prev_col[k][j][2]);
      		}
      		for (var k=0;k<2;k++){									//getting color for new vertices
      			s_col.push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[k+2][0]+new_diffuse[0]+n_s_lighting[k+2][0]));
        		s_col.push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[k+2][1]+new_diffuse[1]+n_s_lighting[k+2][1]));
        		s_col.push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[k+2][2]+new_diffuse[2]+n_s_lighting[k+2][2]));
      		}
        	for(var k=0;k<2;k++){									//setting color for the two new vertices
        		prev_col[k][j+1].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[k+2][0]+new_diffuse[0]+n_s_lighting[k+2][0]));
       			prev_col[k][j+1].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[k+2][1]+new_diffuse[1]+n_s_lighting[k+2][1]));
        		prev_col[k][j+1].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[k+2][2]+new_diffuse[2]+n_s_lighting[k+2][2]));
        	}
      	}
      }
      else{
      	if(j==0){
      		s_col.push(prev_col[i][j][0]);
      		s_col.push(prev_col[i][j][1]);
      		s_col.push(prev_col[i][j][2]);
      		for (var k=0;k<2;k++){
        		s_col.push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[k+1][0]+new_diffuse[0]+n_s_lighting[k+1][0]));
        		s_col.push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[k+1][1]+new_diffuse[1]+n_s_lighting[k+1][1]));
        		s_col.push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[k+1][2]+new_diffuse[2]+n_s_lighting[k+1][2]));
        	}
        	s_col.push(prev_col[i][j+1][0]);
      		s_col.push(prev_col[i][j+1][1]);
      		s_col.push(prev_col[i][j+1][2]);
        	for(var k=0;k<2;k++){									//setting color for the two new vertices
        		prev_col[i+1][k].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[k+1][0]+new_diffuse[0]+n_s_lighting[k+1][0]));
       			prev_col[i+1][k].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[k+1][1]+new_diffuse[1]+n_s_lighting[k+1][1]));
        		prev_col[i+1][k].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[k+1][2]+new_diffuse[2]+n_s_lighting[k+1][2]));
        	}  
      	}
      	else{
      		for (var k=i;k<i+2;k++){
      			s_col.push(prev_col[k][j][0]);
      			s_col.push(prev_col[k][j][1]);
      			s_col.push(prev_col[k][j][2]);
      		}
        	s_col.push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[2][0]+new_diffuse[0]+n_s_lighting[2][0]));
        	s_col.push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[2][1]+new_diffuse[1]+n_s_lighting[2][1]));
        	s_col.push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[2][2]+new_diffuse[2]+n_s_lighting[2][2]));
        	s_col.push(prev_col[i][j+1][0]);
      		s_col.push(prev_col[i][j+1][1]);
      		s_col.push(prev_col[i][j+1][2]);
      	}
      	prev_col[i+1][j+1].push(Math.min(1,og_diffuse[0]+ambient[0]+s_s_lighting[2][0]+new_diffuse[0]+n_s_lighting[2][0]));
        prev_col[i+1][j+1].push(Math.min(1,og_diffuse[1]+ambient[1]+s_s_lighting[2][1]+new_diffuse[1]+n_s_lighting[2][1]));
        prev_col[i+1][j+1].push(Math.min(1,og_diffuse[2]+ambient[2]+s_s_lighting[2][2]+new_diffuse[2]+n_s_lighting[2][2]));      	
      }
      for (var k=0;k<4;k++){
        f_col.push(Math.min(1,og_diffuse[0]+ambient[0]+f_s_lighting[0]+new_diffuse[0]+n_s_lighting[2][0]));
        f_col.push(Math.min(1,og_diffuse[1]+ambient[1]+f_s_lighting[1]+new_diffuse[1]+n_s_lighting[2][1]));
        f_col.push(Math.min(1,og_diffuse[2]+ambient[2]+f_s_lighting[2]+new_diffuse[2]+n_s_lighting[2][2]));
      }
    }
    if(smooth){
    	var n = initVertexBuffers(gl,obj.pos_indices,s_col,new_arr,a_Position);
    }
    else{
    	var n = initVertexBuffers(gl,obj.pos_indices,f_col,new_arr,a_Position);
    }
    if (n < 0) {
      console.log('Failed to set the vertex information');
      return;
    }
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }
  if(toggle_checked){
    draw_normal(gl,a_Position,obj);
  }
  ended=true;
}

function spec(n_normal,lighting,l_col){	//n_normal is the normalized normal
	if (specular == false){			//no specular lighting to be added
		return [0,0,0];
	}
	else{
    var nlighting = normalize(lighting);
    n_normal = normalize(n_normal);
    var scale = 2*dot_product(n_normal,nlighting);
    if(scale<0){
      return [0,0,0];
    }
    var r_vec = [scale*n_normal[0]-nlighting[0],scale*n_normal[1]-nlighting[1],scale*n_normal[2]-nlighting[2]];
    var cos_a = Math.pow(find_cos(r_vec,[0,0,1]),g_factor);
    var ans = [l_col[0]*0*cos_a,l_col[1]*1*cos_a,l_col[2]*0*cos_a];
    return ans;
	}
}

function dot_product(v1,v2){
	return (v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2]);
}

function cross_product(v1,v2){
	return [(v1[1]*v2[2]-v1[2]*v2[1]),(v1[2]*v2[0]-v1[0]*v2[2]),(v1[0]*v2[1]-v1[1]*v2[0])];
}
//normalizing a 3d vector
function normalize(v){
  var len=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  return ([v[0]/len,v[1]/len,v[2]/len]);
}

//calculate the cos(theta) value for the given two vertices
function find_cos(v1,v2){
  var len = Math.sqrt(v1[0]*v1[0]+v1[1]*v1[1]+v1[2]*v1[2]) * Math.sqrt(v2[0]*v2[0]+v2[1]*v2[1]+v2[2]*v2[2]);
  return ((v1[0]*v2[0])+(v1[1]*v2[1])+(v1[2]*v1[2]))/len;
}

function draw_normal(gl,a_Position,obj){
  var temp_arr=[];
  var temp_colors=[];
  var temp_index=[0,1];
  var d_to_center = find_center(obj);
  //draw_mid_line(gl,a_Position);
  for (var i=0;i<36;i++){
    new_arr=[];
    var indices=new Uint8Array(obj.pos_indices);
    for (var j=0;j<obj.num_vertices;j++){
      temp_arr=[];
      temp_colors=[];
      normal_array=[];

      temp_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      temp_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      temp_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][0+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][1+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][2+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      temp_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i+1][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i+1][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[0]+d_to_center[0]+x_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]));
      temp_arr.push(obj.translated[1]+d_to_center[1]+y_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),y_rotate_z_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[0]),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));
      temp_arr.push(obj.translated[2]+d_to_center[2]+z_rotate_x_axis((((obj.x_y_z_coordinates)[i][3+j*3]-d_to_center[0])*obj.scaled),(((obj.x_y_z_coordinates)[i][4+j*3]-d_to_center[1])*obj.scaled),(((obj.x_y_z_coordinates)[i][5+j*3]-d_to_center[2])*obj.scaled),obj.rotated[1]));

      var cross1=[(temp_arr[0]-temp_arr[3]),(temp_arr[1]-temp_arr[4]),(temp_arr[2]-temp_arr[5])];
      var cross2=[(temp_arr[6]-temp_arr[3]),(temp_arr[7]-temp_arr[4]),(temp_arr[8]-temp_arr[5])];
      var midx=(temp_arr[0]+temp_arr[3]+temp_arr[6]+temp_arr[9])/4;
      var midy=(temp_arr[1]+temp_arr[4]+temp_arr[7]+temp_arr[10])/4;
      var midz=(temp_arr[2]+temp_arr[5]+temp_arr[8]+temp_arr[11])/4;
      var product=[(cross1[1]*cross2[2]-cross1[2]*cross2[1])+midx,(cross1[2]*cross2[0]-cross1[0]*cross2[2])+midy,(cross1[0]*cross2[1]-cross1[1]*cross2[0])+midz];
      normal_array.push(midx);
      normal_array.push(midy);
      normal_array.push(midz);
      temp_colors.push(0);
      temp_colors.push(0);
      temp_colors.push(1);
      normal_array.push(product[0]);
      normal_array.push(product[1]);
      normal_array.push(product[2]);
      temp_colors.push(0);
      temp_colors.push(0);
      temp_colors.push(1);
      var n = initVertexBuffers(gl,temp_index,temp_colors,normal_array,a_Position);
      if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
      }
      gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0); 
    }
  }
}

function change_glossiness(gl,a_Position){
	g_factor = document.getElementById("gloss").value;
	console.log("Glossiness factor changed to ",g_factor);
	if(ended){
    output_all(gl,a_Position);
  }
}

//function for initializing all the values and clear all drawings
function new_btn(gl,a_Position){
  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.lineWidth(1);
  // Set the eye point and the viewing volume
  mvpMatrix = new Matrix4();
  mvpMatrix.setLookAt(0, 0, 1000, lookat_x, lookat_y, lookat_z, 0, 1000, 0);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  //draw_mid_line(gl,a_Position);
  for (var i=0;i<37;i++){
    x_y_z_coordinates[i]=new Array();
    f_colors[i]=new Array();
  }
  num_vertices = 0;
  vertex_cal=0;
  prev_x_coordinate = 0; //The x-coordinate of the last clicked point
  prev_y_coordinate = 0; //The y-coordinate of the last clicked point
  prev_z_coordinate = 0; //The z-coordinate of the last clicked point
  pos_indices = new Array();
  mid_line = new Array();
  ended = false;
  normal_array = [];
  line_index = [];
  s_normals = new Array(37);
  v_normals = new Array(37);
  perspective = false;
  num_obj=0; //initialize number of objects to be 0;
  obj_arr = [];
  clicked=false;
  obj_clicked= -1; //to know which object is being clicked
  scale = 1; //value for scaling
  trans = [0,0,0];
  rotates = [0,0];
  camera_x=0;
  camera_y=0; 
  camera_z=1000;
  lookat_x=0;
  lookat_y=0;
  lookat_z=-1000;
  middle_clicked=false;
}

//updateScreen function to read data from file and pass them into the global variables then draw
function updateScreen(gl,a_Position){
  ended=true;
  var sorObject = readFile();
  var coordinates=new Array(37);
  var colors = new Array(37);
  pos_indices=sorObject.indexes;
  num_vertices=sorObject.vertices.length/36/3;
  normal_array = [];
  clicked=false;
  obj_clicked= -1; //to know which object is being clicked
  scale = 1; //value for scaling
  trans = [0,0,0];
  rotates = [0,0];
  for (var i=0;i<37;i++){
    coordinates[i]=new Array();
    colors[i]=new Array();
    v_normals[i]=new Array();
    s_normals[i]=new Array();
  }
  for (var i=0;i<36;i++){
    for(var j=0;j<num_vertices;j++){
      coordinates[i].push(sorObject.vertices[i*num_vertices*3 + j*3]);
      coordinates[i].push(sorObject.vertices[i*num_vertices*3 + j*3+1]);
      coordinates[i].push(sorObject.vertices[i*num_vertices*3 + j*3+2]);
      colors[i].push(1);
      colors[i].push(0);
      colors[i].push(0);
    }
  }
  for(var j=0;j<num_vertices;j++){
    coordinates[36].push(coordinates[0][j*3]);
    coordinates[36].push(coordinates[0][j*3+1]);
    coordinates[36].push(coordinates[0][j*3+2]);
    colors[36].push(1);
    colors[36].push(0);
    colors[36].push(0);
  }
  obj_arr.push(new obj_class(coordinates,colors,pos_indices,num_vertices,num_obj,1,trans,rotates));
  num_obj++;
  output_all(gl,a_Position);
}

function find_center(obj){
  var x=0;
  var z=0;
  var y=0;
  var v=obj.num_vertices;
  for (var i=0;i<36;i++){
    for (var j=0;j<obj.num_vertices;j++){
      y+=obj.x_y_z_coordinates[i][3*j+1];
    }
  }
  y=y/(36*obj.num_vertices);
  return [x,y,z];
}

//function for saving the variables into the file
function save_file(){
  var save_file_name=document.getElementById("save_name").value;
  var temp_arr = [];
  for (var j=0;j<36;j++){
    for (var i=0;i<num_vertices;i++){
      temp_arr.push(x_y_z_coordinates[j][3*i]);
      temp_arr.push(x_y_z_coordinates[j][3*i+1]);
      temp_arr.push(x_y_z_coordinates[j][3*i+2]);
    }
  }
  saveFile(new SOR(save_file_name, temp_arr, pos_indices));
  ended=true;
}