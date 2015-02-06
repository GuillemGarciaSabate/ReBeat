/**
 * Welcome to ReBeat App, a tool to find that song you were thinking of and play it on Spotify
 *@author Guillem Garcia Sabate: software developer
 *@version 1.0.1 in HATCHING state
 */


var ReBeat = {
	/**
	*
	*This method is launched when the App it's opened by first time
	*and also after some actions that are later explained. It loads the most popular
	*tracks from Lastfm API service, then it records the thumbnail, name and album
	*and append it to a container structure called basicBloc
	*/
	mostPopular : function(){

		if($('#init')) {
			$('#init').remove();
		}

		var api_url_most_popular = "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=alternative&api_key=3650f6bba8e0bc1f9d41f6ae860cb18f&format=json";
		//all the http requests are made via AJAX, also some DOM updates
		var dades = AJAX.request(api_url_most_popular);

		
		var thumbnail = [];
		var name = [];
		var album = [];

		var div = Layout.createContainer("init", "div");
		document.body.appendChild(div);

		var list_item = Layout.createContainer("popularTracks", "ul");
		list_item.addEventListener("click", this.clickResponse);
		document.body.appendChild(list_item);

		var title;
		var image;
		var src;
		var basicBloc;

		var i=1;
		for(j=1; j<dades.toptracks.track.length; j++){

			if(dades.toptracks.track[j].image){

				thumbnail[i]=dades.toptracks.track[j].image[3]["#text"];
				name[i] = dades.toptracks.track[j].name;
				album[i] = dades.toptracks.track[j].artist.name;
				name[i] = name[i].replace(/[.',!]/g, " ");
				album[i] = album[i].replace(/[.',!]/g," ");
				
		
				//creo els contenidors de cada cosa
				title = Layout.createContainer(i, "p");
				image = this.render(thumbnail[i], name[i]);

				title.innerHTML = name[i];

				basicBloc = Layout.createContainer("basicBloc"+i, "li");
				basicBloc.setAttribute("data-name",name[i]);
				basicBloc.setAttribute("data-album",album[i]);
				basicBloc.appendChild(title);
				basicBloc.appendChild(image);

				list_item.appendChild(basicBloc);
				div.appendChild(list_item);
				i++;
			}
		}
	},

	/**
	*This method it's responsible of getting the information from Spotify that will be later treated to get
	*all the data from wich we can generate sugestions, searches and reproductions
	*@param name name of the song
	*@param album name of the album
	*@param action if action is set to 1 the function will return the raw data, if it's set to 0
	*it will return manufractured data, containing a preview of the song and a spotify link to play it
	**/
	spotifyPlayLink : function(name, album, action){
				
		var dades = AJAX.request("https://api.spotify.com/v1/search?q="+name+"+"+album+"&type=track");
		var aux = [];
		
		if(action==1){
			if(dades.tracks.items.length==0){
				return null;
			}
			return dades;
		}
		if(action==0){
			if(dades.tracks.items.length==0){
				aux=-1;
				return aux;
			}else{
				aux[0] = dades.tracks.items[0].preview_url;
				aux[1] = dades.tracks.items[0].uri;
				return aux;
			}

		}
		
	},

	/**
	*Once you click an object, this method will get his information and send it to SpotifyPlayLink
	*@param e It's a reference to the clicked object, you don't need to pass it by param, it's implemented throw
	*an eventListener() 
	*/
	clickResponse : function(e){

		var list_item;
		var name;
		var album;
		var src;

		if($(".addB").length) {
					
		}
		else{
			if(e.target.nodeName == "IMG"){
				list_item = e.target.parentNode.parentNode;
			}
			else{
				if(e.target.nodeName == "P"){
					list_item = e.target.parentNode;
				}
				else list_item = e.target;
			}
			
			name = list_item.getAttribute("data-name");
			album = list_item.getAttribute("data-album");

			src = aux.spotifyPlayLink(name, album, 0);

			aux.embeding(src);
		}
	},

	/**
	*This method generates a figure within an image inside, it will facilitate the code
	*@param thumbnail this is the url from the image to generate
	*@param name this is the name of the image
	**/
	render : function(thumbnail, name){
		var figure = document.createElement("figure");

    	var img = Layout.createImage(thumbnail, name);

	    figure.appendChild(img);

	    return figure;
	},
	
	/**
	*This method load he Search Engine
	*As you can see, the search it's only made every 1 second, due to performance things
	*/
	loadsearchEngine : function(){
		setInterval(search,1000);
		function search(){
			AJAX.searchEngine();
		}
	},

	/**
	*This method will be called when we want to play or pre-view a song
	*@param src it's an array, containing in @param src[0] the pre-view of the song, 30 seconds that let you know if this is your son
	*then @param src[1] it's the source of an emeded Spotify Window, that you can use to play the song if you got spotify installed
	*or to open it in the Spotify web page if you don't got it.
	*/
	embeding : function(src){
		try{
			var auxiliar;
			auxiliar = Layout.createContainer("init","div");
			auxiliar.innerHTML="<iframe src='https://embed.spotify.com/?uri="+src[1]+"' id='embed' width=80% height=100% frameborder='0' allowtransparency='true'></iframe><br><iframe src="+src[0]+" width=1% height=1% frameborder='0' allowtransparency='true'>";

			$("#init").replaceWith(auxiliar);
		}catch(ex){
			console.log("Spotify is not providing good data");
		}
		
	},
	/**
	*This method Re-builds the appearance of the DOM depending on users interaction with the App
	*@param dades it's a collection of raw data coming from spotifyPlayLink
	*@param fin if fin it's 15, the page will be cleanded, this measure asure that won't be an overflow of informtion
	*at the DOM
	*/
	loadSearchResults : function(dades, fin){
		var thumbnail = [];
		var name = [];
		var album = [];
		var title;
		var image;
		var index=1;
		var div = Layout.createContainer("init", "div");
		if(fin==15){
			$("#init").remove();
		}
		
		document.body.appendChild(div);
		var listedResult = Layout.createContainer("listedResult", "ul");
		listedResult.addEventListener("click", aux.clickResponse);

			//A Callback used to simplify code
			//Here the containers with the data are created and filled
			function printer(i){
				title = Layout.createContainer(index, "p");
				image = ReBeat.render(thumbnail[i], name[i]);
				title.innerHTML = name[i];
				basicBloc = Layout.createContainer("basicBloc"+index, "li");
				basicBloc.setAttribute("data-name",name[i]);
				basicBloc.setAttribute("data-album",album[i]);
				basicBloc.appendChild(title);
				basicBloc.appendChild(image);
				listedResult.appendChild(basicBloc);
				div.appendChild(listedResult);
				index++;
			}

		for(i=1; i<20; i++){
			//Depending of the kind of search that is going on, the method will substract specific data from dades
			if($("#selectionType").length){
				if(document.getElementById("song").checked && dades.tracks.items[i].hasOwnProperty('album') && dades.tracks.items[i].album.hasOwnProperty('images')){
					thumbnail[i] = dades.tracks.items[i].album.images[1].url;
					name[i] = dades.tracks.items[i].name;
					album[i] = dades.tracks.items[i].album.name;
					name[i] = name[i].replace(/[.',!]/g, " ");
					album[i] = album[i].replace(/[.',!]/g," ");
					if(aux.spotifyPlayLink(name[i],album[i],0) != -1){
						printer(i);
					}	
				}
				if(document.getElementById("author").checked && dades.artists.items[i].hasOwnProperty('type') && dades.artists.items[i].hasOwnProperty('images')){
						/**
						*Many Albums don't got image, this is a cathed bug
						*@throws if the image is not found, it will be replaced by a local image
						*/
						try{
							thumbnail[i] = dades.artists.items[i].images[1].url;
							name[i] = dades.artists.items[i].name;
							album[i] = dades.artists.items[i].type;
							name[i] = name[i].replace(/[.',!]/g, " ");
							if(aux.spotifyPlayLink(name[i],album[i],0) != -1){
								printer(i);
							}	
						}catch(ex){
							thumbnail[i] ="img/not available.png";
							name[i] = dades.artists.items[i].name;
							album[i] = dades.artists.items[i].type;
							name[i] = name[i].replace(/[.',!]/g, " ");
							if(aux.spotifyPlayLink(name[i],album[i],0) != -1){
								printer(i);
							}	
							console.log("Missing images, Spotify not providing");
						}	
					

				}
				if(document.getElementById("album").checked && dades.albums.items[i].hasOwnProperty('album_type') && dades.albums.items[i].hasOwnProperty('images')){
					thumbnail[i] = dades.albums.items[i].images[1].url;
					name[i] = dades.albums.items[i].name;
					album[i] = dades.albums.items[i].album_type;
					name[i] = name[i].replace(/[.',!]/g, " ");
					album[i] = album[i].replace(/[.',!]/g," ");
					if(aux.spotifyPlayLink(name[i],album[i],0) != -1){
						printer(i);
					}	
				}

			}else{
				if(dades.tracks.items[i].hasOwnProperty('album') && dades.tracks.items[i].album.hasOwnProperty('images')){
					thumbnail[i] = dades.tracks.items[i].album.images[1].url;
					name[i] = dades.tracks.items[i].name;
					album[i] = dades.tracks.items[i].album.name;
					name[i] = name[i].replace(/[.',!]/g, " ");
					album[i] = album[i].replace(/[.',!]/g," ");
					if(aux.spotifyPlayLink(name[i],album[i],0) != -1){
						printer(i);
					}	
				}
			}
		}
	}
}

var AJAX = {
	/**
	*this method retrive data from internet, being AJAX make it asynchronous wich improves the user expirience
	*@param url URL from where the App will retrive data
	*/
	request: function(url){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, false);
		
		xhr.send();
		var ans = JSON.parse(xhr.responseText);

		return ans;
	},
	/**
	*This method retrive data from what the user type in the search engine, it usees the request method
	*@param query it's the information that the user wants to look for
	*/
	loadTracks: function(query){
		var search = ".";
		var aux = -1;
		if(document.getElementById("selectionType")){
			if(document.getElementById("author").checked){
				search="artist";
			}
			if(document.getElementById("album").checked){
				search="album";
			}
			if(document.getElementById("song").checked){
				search="track";
			}
			if(search=="."){
				search="track";
			}
		}
		else{
			search="track";
		}
		var dades = this.request("https://api.spotify.com/v1/search?q="+query+"&type="+search);
		return dades;
	},
	/**IMPLEMENTS THE SEARCH ENGINE**/
	searchEngine: function(){
		var query = document.getElementById("buscador").value;

		if(query != '') {
			var i = 15;
			var searchOptions = [];
			var arr;
			searchOptions = this.loadTracks(query);

			if($('#datalist1')) {
				$('#datalist1').remove();
			}
			var insert = document.createElement('datalist');
			document.body.appendChild(insert);
			$("datalist").attr('id', 'datalist1');
			
			if(query!=undefined)
				aux.loadSearchResults(searchOptions, i);
		}
		else{aux.mostPopular();}
	},
	/**
	*An asynchronous method to load container make the App capable of loading elements even when it's already loaded
	*@param element type of element you want to create
	*@param id id
	*@param item id of the element where you want to insert it in the DOM
	*/
	loadContainer: function(element,id,item){
		var container = document.createElement(element);
		container.id = id;

		document.getElementById(item).appendChild(container);
	}

}


var Layout = {
	/**
	*it create a new container
	*@param id id
	*@param element element
	*/
	createContainer: function(id, element){
    	var container = document.createElement(element);
		container.id = id;

		return container;
    },
    //ALERT! @deprecated
    createLink: function(src, element, srcE){
    	var container = document.createElement('a');
    	container.href = src;
    	var content;

    	if(element=='img'){
    		content = document.createElement('img');
    		content.src=srcE;
    	}else{
    		content = document.createElement(element);
    		content.innerHTML=srcE;
    	}
    	container.appendChild(content);

    	return container;

    },
    /**
    *This method creates a image, it simplifies work to the programer, it's not fully extended
    *but his usage it's increasing
    *@param thumbnail url of the image
    *@param name name of the image
    */
    createImage: function(thumbnail, name){
    	var img = document.createElement("img");
	    img.src = thumbnail;
	    img.alt = name;
	    return img;
    },
}

//object Menu it's responsible of the good performance of everything on the menusbar
var Menu = {

	/**
	*It loads the green Menu with the three options
	*@param q a counter used to guess in wich place of the matrix are we
	*/
	createMenu: function(q){
		
		if($("#actions").length) {
			//if it's set nothing should change
		}else{
			var init = document.getElementById("init");
			var tools = Layout.createContainer("actions", "div");
			var options = Layout.createContainer("opciones", "ul");

			tools.appendChild(options);
			document.body.insertBefore(tools, init);

			var butAP = Layout.createContainer("AP", "button");
			var butS = Layout.createContainer("S", "button");
			var butT = Layout.createContainer("T", "button");

			var nodeAP = document.createElement("li");
			var nodeS = document.createElement("li");
			var nodeT = document.createElement("li");

			var textnode = document.createTextNode("Add to Playlist");
			butAP.appendChild(textnode);
			nodeAP.appendChild(butAP);
			document.getElementById("opciones").appendChild(nodeAP);

			textnode = document.createTextNode("Suggestions");
			butS.appendChild(textnode);
			nodeS.appendChild(butS);
			document.getElementById("opciones").appendChild(nodeS);

			textnode = document.createTextNode("Tools");
			butT.appendChild(textnode);
			nodeT.appendChild(butT);
			document.getElementById("opciones").appendChild(nodeT);

			$("#AP").on('click', function () {
	   			 Menu.showPlaylist(q);
	  		})

	  		$("#S").on('click', function () {
	  			//@param resug even it's not a paramether, it's important to know that if resug (re-suggerminet) it's true, there are not more sugeriments and q=0 again
	  			 if(resug==true){
	  				q=0;
	  			 }
	  			 q++;
	  			 console.log(q);
	   			 Menu.suggestions(q);
	  		})

	  		$("#T").on('click', function () {
	  			Menu.tools();
	  		})
  		}
	},
	/**
	*this method creates the elements needed to start adding playlists
	*@param q it's the same counter that the previous method
	*/
	showPlaylist: function(q){
		if($("#selectPlaylist").length) {
			//if it's set nothing should change
		}else{
			var init = document.getElementById("init");
			var tools = Layout.createContainer("selectPlaylist", "div");
			var options = Layout.createContainer("playlist", "ul");

			tools.appendChild(options);
			$(tools).insertAfter(init);

			var defaultPlaylist = Layout.createContainer("dPl", "button");

			var playlist0 = document.createElement("li");

			var textnode = document.createTextNode("CreatePlaylist");
			defaultPlaylist.appendChild(textnode);
			playlist0.appendChild(defaultPlaylist);
			document.getElementById("playlist").appendChild(playlist0);

			$("#dPl").on('click', function () {
	   			 Menu.CreatePlaylist(q);
	  		})
		}
	},
	//CreatePlaylist creates a new playlist with the appropiate elements to add songs and play them
	CreatePlaylist: function(q){

		if($("#inputlist").length) {
			//if it's set nothing should change
		}else{
			var i = 0;
			//q=0;
			AJAX.loadContainer("li","inputlist","playlist");
			AJAX.loadContainer("input","newlist","inputlist");
			AJAX.loadContainer("button","add", "inputlist");

			$("#add").on('click', function () {
				var imB = Layout.createImage("img/playB.png","play");
			    var name = $("#newlist").val();
			    var newButton = Layout.createContainer("dPl "+name+"Button","button");
			    var playButton = Layout.createContainer("pB "+q, "button");
			    imB.style.height= '100%';
			    playButton.style.marginLeft = '5px';
			    playButton.style.height = '5%';
			    playButton.style.marginTop = '13%';
			    playButton.appendChild(imB);
			    newButton.innerHTML = name;
			    AJAX.loadContainer("li",name,"playlist");
			    document.getElementById(name).style.display = 'inline-flex';
			    document.getElementById(name).style.width = '99%';
			    document.getElementById(name).appendChild(newButton);
			    document.getElementById(name).appendChild(playButton);
			    q++;
		    	$(newButton).on('click', function () {
	   				Menu.Selectsongs(name);
	  			})

	  			$(playButton).on('click', function () {
	  				var id = this.getAttribute("id");
	  				id = id.replace("pB ","");
	  				Menu.playPlaylist(id,1);
	  			})
			})
		}
	},
	/**
	*This method reproduce the songs stored in the playlist
	*@param id it's the number of identification of the playlist
	*@param i it's the song from the playlist that is going to be reproduced
	*/
	playPlaylist: function(id,i){
		var aux;
		var longitud = matrix[id].length;
		var deleteButton;
		var deleteImage;
		//the app has previously stored all the songs in a format song:album
		aux = matrix[id][i].split(":");
		//here the app get the song URLs an embed it to the user interfaces
		ReBeat.embeding(ReBeat.spotifyPlayLink(aux[0],aux[1],0));
		aux[0] = Layout.createContainer("next","button");
   		aux[1] = Layout.createImage("img/next.png","proxim");
   		deleteButton = Layout.createContainer("delete","button");
   		deleteImage = Layout.createImage("img/delete.png", "delete");

   		aux[1].style.height = '14%';
   		aux[0].style.float = 'right';
   		aux[0].style.right = '26%';
   		aux[0].style.position = 'fixed';
   		aux[0].style.top = '37vh';
   		aux[0].appendChild(aux[1]);

   		deleteImage.style.height = '14%';
   		deleteButton.style.float = 'right';
   		deleteButton.style.right = '26%';
   		deleteButton.style.position = 'fixed';
   		deleteButton.style.top = '57vh';
   		deleteButton.appendChild(deleteImage);

   		document.getElementById("init").appendChild(aux[0]);
   		document.getElementById("init").appendChild(deleteButton);
   		
   		i++;
   		//this is a link to jump to the next song
   		$(aux[0]).on('click', function () {
   			if(i==longitud){
   				$("#init").remove();
    			ReBeat.mostPopular();
   			}
   			console.log("added to: "+id+" playlist a song in the position: "+i);
  			Menu.playPlaylist(id,i);
  		})
  		//this is a link to delete the actual song
  		$(deleteButton).on('click', function () {
  			
   			if(i==longitud){
   				$("#init").remove();
    			ReBeat.mostPopular();
   			}
   			Menu.PlayListManager(id,i-1,0);
  		})

	},
	/**
	*this method appends a button on the top of each basicBloc, so you can add those songs to the playlist
	*@param list this is the name of the playlist where you want to add the song, when we click a add buton it's pased by paramether to another method that we will see
	*/
	Selectsongs: function(list){
		
		$('.addB').remove();
		if($("#listedResult").length) {
			var longitude = document.getElementById("listedResult").childNodes.length;			
		}
		else{
			var longitude = document.getElementById("popularTracks").childNodes.length;
		}
		
		var album = [];
		var name = [];
		var bt;
		var img;
		var aux = [];

		while(longitude > 0){
			album[longitude] = $("#basicBloc"+longitude).attr("data-album");
			name[longitude] = $("#basicBloc"+longitude).attr("data-name");
			bt = Layout.createContainer(name[longitude]+":"+album[longitude]+"-"+longitude,"button");
			img = Layout.createImage("img/add.jpg","provisional");
			img.style.height = '19px';
			img.style.width = '19px';

			bt.appendChild(img);
			bt.style.height = '22px';
			bt.style.width = '22px';
			bt.style.paddingLeft = '0px';
			bt.style.paddingTop = '0px';
			bt.style.marginLeft = '3px';
			$(bt).addClass("addB");

			document.getElementById(longitude).appendChild(bt);

			longitude--;
		}

		$(".addB").on('click', function(){
			bt = this.getAttribute("id");
			aux = bt.split("-");
			Menu.PlayListManager(aux[0],list, 1);
		})
	},
	/**
	*each time we press Suggestions, this method is going to show related songs with the q position of every existing playlist unless there are not more songs
	*in this case, it will load the most popular songs from last fm
	*e.g. 1)matrix[0][1] & matrix[1][1] 2)matrix[0][2] & matrix[1][2]
	*@param q it's a counter to locate our position into the matrix, 
	*/
	suggestions: function(q){

		var Name;
		var dades;
		var fin = 15;
		$("#init").remove();

		for(j=0; j<matrix.length; j++){


			if(matrix[j][q]!=undefined){
				Name = matrix[j][q].split(":");
				dades = AJAX.request("https://api.spotify.com/v1/search?q="+Name[1]+"&type=track");
				ReBeat.loadSearchResults(dades, fin);
				resug=false;
			}
			else{
				resug=true;
				$("#init").remove();
   				ReBeat.mostPopular();
			}
			
		}
	},
	/**
	*This is the heart of the matrix, it add the songs or delete them depending on the users choice
	*@param song song
	*@param playlist playlist name
	*@param action if action is set to 0 songs will be deleted from the playlist, if are set to 1, will be added
	*/
	PlayListManager: function(song, playlist, action){

		var bool = false;
		if(action==1){

			for(i=0; i<matrix.length; i++){
				//first it looks for the playlist, if it's found, the song it's added to it
				if(matrix[i][0] == playlist){
					matrix[i].push(song);//pe
					bool = true;
				}

			}
			//if it's not found a new playlist it's created and the song added to it
			if(bool == false){
				var longitud = matrix.length;
				matrix[longitud] = [];
				matrix[longitud].push(playlist);//pe
				matrix[longitud].push(song);
				bool = true;
			}
		}
		//on deleting a song, the matrix it's re-trimed (ALERT due to development reasons, the song and playlist names are switched, but this is operative and functional!)
		if(action==0){
			console.log("Deleted from the playlist: "+song+" the song: "+playlist);
			matrix[song].splice(playlist,1);
			Menu.playPlaylist(song,playlist);
		}
	},
	//this method allows the user to choose if they want to search by album, song or artist, by default it will search by song
	tools: function(){
		if($("#selectionType").length) {
			//if it's set nothing should change
		}else{
			AJAX.loadContainer('form','selectionType', 'box2');

		  	var author = document.createElement("input");
		  	author.setAttribute("type","radio");
		 	author.setAttribute("name","selectionT");
		 	author.setAttribute("id","author");
		 	var text = document.createTextNode("Search by Author");
		 	document.getElementById("selectionType").appendChild(author);
		 	$(text).insertAfter(author);

		  	var album = document.createElement("input");
		  	album.setAttribute("type","radio");
		  	album.setAttribute("name","selectionT");
		  	album.setAttribute("id","album");
		  	text = document.createTextNode("Search by Album");
		  	document.getElementById("selectionType").appendChild(album);
		 	$(text).insertAfter(album);

		    var song = document.createElement("input");
		  	song.setAttribute("type","radio");
		  	song.setAttribute("name","selectionT");
		  	song.setAttribute("id","song");
		  	song.setAttribute("checked","checked");
		  	text = document.createTextNode("Search by Song");
		  	document.getElementById("selectionType").appendChild(song);
		 	$(text).insertAfter(song);
		}
	}
}
//matrix is an important element, it stores in RAM the playlists and the songs you safe, the first element of each array will be the playlist name
var matrix = [];
var aux = ReBeat;
var resug = false;
var bool = false;
//the first thing the app does it's calling the mostPopular method
aux.mostPopular();
//then it loads the search engine
$("#buscador").keyup(aux.loadsearchEngine);


$("#buttonSearch").on('click', function () {
	var q=0;
    Menu.createMenu(q);
})

$("#home").on('click', function () {
	$("#init").remove();
    ReBeat.mostPopular();
})