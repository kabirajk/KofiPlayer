class JioSaavanApi{
    constructor(){
        this.apiDomain='https://check2-git-dev-kabirajk.vercel.app';
        this.searchbar=$("#Searchbar");
        this.lasturl={query:"",page:1};
    }
    SearchAll(callback,afterCall){
        let query=this.searchbar.val();
        // query=query.toLowerCase();
        // query=query.replace(/\s/g,"+");
        // https://saavn.me/search/all?query=imagine+dragons
        let url = `/search/all?query=${query}`;
        afterCall.getDetailsFromUrl=this.getDetailsFromUrl;
        afterCall.getData=this.getData;
        this.getData(encodeURI(url),callback,function(resp){console.log(resp)},afterCall);
    }
    searchSongs(callback,afterCall,page=1,limit=20){
        let self   =this;
        let query=this.searchbar.val();
        // query=query.toLowerCase();
        // query=query.replace(/\s/g,"+");
        if(self.lasturl.query == query){
            self.lasturl.page+=1;
            page=self.lasturl.page;
        }else{
            self.lasturl.query=query;
            self.lasturl.page=page
        }
        page=page?page:1;
        let url=`/search/songs?query=${query}&limit=${limit}&page=${page}`
        this.getData(encodeURI(url),callback,function(resp){console.log(resp)},afterCall);
    }
    searchAlbum(callback,afterCall){
        let query=this.searchbar.val();
        query=query.toLowerCase();
        query=query.replace(/\s/g,"+");
        let url=`/search/albums?query=${query}`
        this.getData(url,callback,function(resp){console.log(resp)},afterCall);
    }
    getDetailsFromUrl(queryUrl,callback,afterCall){
        let url=""
        if(queryUrl.includes("/album/")){
            url+=`/albums?link=${queryUrl}`;
        }else if(queryUrl.includes("/song/")){
            url+=`/songs?link=${queryUrl}`;
        }
        this.getData(url,callback,function(resp){console.log(resp)},afterCall);
    }
    getData(url,sucessCallback,failureCallBack,afterCall){
        $.ajax(
        {//always use mumbai servers are else it wil give less results
            url:'https://kofiplayer-saavn.vercel.app'+url,
            type:'GET',
            success:function(resp){
                if(sucessCallback){
                    sucessCallback(resp,afterCall);
                }
            },
            error:function(resp){
                if(failureCallBack){
                    failureCallBack(resp);
                }
            }
        })
    }
}

class NavBar{
    constructor(Element){
        this.NavBar = $(Element);
        this.bindEvents();
    }
    bindEvents(){
        let self=this;
        this.type={
            0:'.song',
            1:'.playlist',
            2:'.artist',
            3:'.album',
        }
        self.NavBar.on('click',function(event){
            let selected = $(event.target).closest('.ui-navigation-bar-child');
            let animate= false;
            if(selected.length){
                let current = self.getSelectedValue();
                $('.selected',self.NavBar).removeClass('selected');
                $(self.type[current],"#MusicCardWrapper").hide();
                selected.addClass('selected');
                let choosed = self.getSelectedValue();
                $(self.type[choosed],"#MusicCardWrapper").show();

            }
        });
    }
     changeMenu(index){
            let self=this;
            let current = self.getSelectedValue();
            $('.selected',self.NavBar).removeClass('selected');
            $(self.type[current],"#MusicCardWrapper").hide();
            $(self.type[index],self.NavBar).addClass('selected');
            let choosed = self.getSelectedValue();
            $(self.type[choosed],"#MusicCardWrapper").show();
        }
    getSelectedValue(){
        let self = this
        return $('.selected',self.NavBar).index(); 
    }
}

class Kofiplayer{
    constructor(){
        let self = this;
        this.AudioPlayer= new Audio();
        this.Api=new JioSaavanApi();
        this.libNavBar= new NavBar($('ul.ui-navigation-bar-parent'));
        this.currentAudioname="";
        this.volume='v2';
        this.muted=this.AudioPlayer.muted;
        this.playlist=[];
        this.audioSrc="";
        this.seeking=false;

        this.playerControls=$("#playerControls");
        this.MusicCardWrapper=$("#MusicCardWrapper");
        this.mediaInfo=$("#mediainfo");
        this.songTitle=$('.song-title',this.mediaInfo);
        this.songartist=$(".song-artist",this.mediaInfo);
        this.coverArt=$('img','.preview');
        this.playlistLike=$('.playlist-like');
        this.like=$('.like',this.playlistLike);
        this.playlist=$('.playlist',this.playlistLike);
        this.playpausecontrols=$('.play-pause-controls',this.playerControls);
        this.previous=$('.previos',this.playpausecontrols);
        this.playPause=$('.play-pause',this.playpausecontrols);
        this.next=$('.next',this.playpausecontrols);
        this.seekBarWrapper=$('.slidebar');
        this.seekBar=$('#seekBar',this.seekBarWrapper);
        this.currentTime=$('.current-time',self.seekBarWrapper)
        this.duration=$('.duration-time',this.seekBarWrapper);
        this.advanedmediaControl=$('.advanced-media-controls',this.playerControls);
        this.soundControl=$(".sound-control",this.advanedmediaControl);
        this.playQueue=$('.queue',this.soundControl);
        this.mode=$('.mode',this.soundControl);
        this.volumeControls=$('.volume-control',this.soundControl);
        this.Volumeslider=$("#Volume",this.volumeControls);
        this.volumeIcons=$(".volume",this.volumeControls);


        this.selectedSongCard=undefined;
    }
    setAudioSrc(srcString){
        this.audioSrc=srcString;
    }
    setVolume(level){
        level=level ? parseInt(level) :0;
        this.AudioPlayer.volume=level/100;
    }
    getVolume(level){
        return this.AudioPlayer.volume;
    }
    setTime(time){
        this.AudioPlayer.currentTime=time;
    }
    getTime(time){
        return this.AudioPlayer.currentTime;
    }
    getduration(){
        returnthis.AudioPlayer.duration
    }
    downloadAudio(url){
        //
    }
    getURlsource(source,quality){
        return source.downloadUrl[quality];
    }
    getSongsFromAlbumCard(card){
        let self = this;
        let albumdata = $(card).data('albumdata');
        let url=albumdata.url
        self.Api.getDetailsFromUrl(url,self.populateSongFromAlbum,self.populateSongResponse)

    }
    playSongFromCard(card){
        let self =this
        self.selectedSongCard=card;
        let source=card.data('musicdata');
        //set audio;
        self.AudioPlayer.pause()
        try{
            if(self.AudioPlayer.paused){
                self.playPause.removeClass('pause');
            }
            let url=""
            if(source.downloadUrl['320kbps']){
                url=source.downloadUrl['320kbps'];
            }
            else if(source.downloadUrl['160kbps']){
                url=source.downloadUrl['160kbps'];
            }
            else if(source.downloadUrl['96kbps']){
                url=source.downloadUrl['96kbps'];
            }
            else if(source.downloadUrl['48kbps']){
                url=source.downloadUrl['48kbps'];
            }
            else if(source.downloadUrl['12kbps']){
                url=source.downloadUrl['12kbps'];
            }
            self.AudioPlayer.src=url;
            let play=self.AudioPlayer.play();
            play.then((r)=>{
                self.playPause.addClass('pause');
            }).catch((err)=>{
                console.log(err)
            });
            self.coverArt.attr('src',$("img",card).attr('src'));
            self.songTitle.text(source.title);
            self.songartist.text(source.artist);
        }
        catch(err){
            console.log('load error',err)
        }
    }
    seekNextAudio(){
        let self=this;
        let nextCard= $(self.selectedSongCard).next();
        while(!nextCard.hasClass('song') && nextCard.length){
            nextCard= $(nextCard).next();
        }
        if(nextCard.length){
           self.playSongFromCard(nextCard);
        }
    }
    seekPrevAudio(){
        let self=this;
        let previousCard= $(self.selectedSongCard).prev();
        while(!previousCard.hasClass('song') && previousCard.length){
            previousCard= $(previousCard).next();
        }
        if(previousCard.length){
            self.playSongFromCard(previousCard);
        }
    }
    constructTime(currentTime,duration){
        if(!duration){
            duration = currentTime;
        }
        var time=`${(""+Math.floor((currentTime%3600)/60)).padStart(2,'0')}:${(""+Math.floor((currentTime%3600)%60)).padStart(2,'0')}`;
        if(Math.floor(duration/3600) >0){
            return ((""+Math.floor(currentTime/3600)).padStart(2,'0'))+":"+time;
        }
        return time
    }
    bindEvents(){
        let audioPlayer = $(this.AudioPlayer);
        this.AudioPlayer.autoplay=true;
        let self=this;
        self.Api.searchbar.on('keydown',function(event){
            if(event.key!="Enter") {
                return
            }
            let index = self.libNavBar.getSelectedValue();
            // self.Api.SearchAll(self.populateFromAllSearch,{songCard:self.populateSongResponse,albumCard:self.populateAlbumResponse});
            if(index ==0 ){
                self.Api.searchSongs(self.populateSongResponse);
            }else if(index ==3){
                self.Api.searchAlbum(self.populateAlbumResponse);
            }
        });
        audioPlayer.on('play',function(event){

        });
        audioPlayer.on('pause',function(event){

        });
        audioPlayer.on('timeupdate',function(event){
            if(self.AudioPlayer.duration && !self.seeking){
                self.currentTime.text(self.constructTime(self.AudioPlayer.currentTime));
                self.seekBar.val(Math.floor((self.AudioPlayer.currentTime/self.AudioPlayer.duration)*100));
            }
        });
        audioPlayer.on('loadedmetadata',function(event){
            self.currentTime.text(self.constructTime(self.AudioPlayer.currentTime));
            self.duration.text(self.constructTime(self.AudioPlayer.duration));
        });
        audioPlayer.on('ended',function(event){
            if(self.AudioPlayer.autoplay){
                // seekNextSrc
                self.playPause.removeClass('pause');
                self.seekNextAudio();
            }
        });
        self.playpausecontrols.on('click',function(event){
            let closest = $(event.target).closest('button');
            if(closest.hasClass('play-pause')){
                if(self.AudioPlayer.paused){
                    self.playPause.addClass('pause');
                    self.AudioPlayer.play();
                }
                else{
                    self.playPause.removeClass('pause');
                    self.AudioPlayer.pause();
                }
            }else if(closest.hasClass('previos')){
                self.seekPrevAudio();
            }else if(closest.hasClass('next')){
                self.seekNextAudio();
            }
        });
        self.seekBar.on('mousedown',function(){
            self.seeking=true;
        })
        self.seekBar.on('input',function(){
            let time=self.AudioPlayer.duration*(self.seekBar.val()/100);
            self.currentTime.text(self.constructTime(time));
        });
        self.seekBar.on('change',function(){
            let time=self.AudioPlayer.duration*(self.seekBar.val()/100);
            self.currentTime.text(self.constructTime(time));
            self.AudioPlayer.currentTime=time;
            self.seeking=false;
        });
        audioPlayer.on('volumechange',function(event){
            //for keybinds
        });
        self.Volumeslider.on('input',function(event){
            self.AudioPlayer.volume=(self.Volumeslider.val()/100);
            !self.AudioPlayer.muted?self.volumeIcons.removeClass(self.volume):undefined;
            self.volume=self.getVolumeclass(self.Volumeslider.val());
            !self.AudioPlayer.muted?self.volumeIcons.addClass(self.volume):undefined;
        });
        self.volumeIcons.on('click',function(){
            if(self.AudioPlayer.muted==false){
                self.AudioPlayer.muted=!self.AudioPlayer.muted;
                self.volumeIcons.removeClass(self.volume);
                self.volumeIcons.addClass('vx');
            }else{
                self.AudioPlayer.muted=!self.AudioPlayer.muted;
                self.volumeIcons.removeClass('vx');
                self.volumeIcons.addClass(self.volume);
            }
        })
        self.MusicCardWrapper.on('click',function(event){
            let card=$(event.target).closest('.card');
            self.selectedSongCard=card;
            if(card.length && card.hasClass('song')){
                self.playSongFromCard(card);
            }else if(card.length && card.hasClass('album')){
                self.getSongsFromAlbumCard(card);
                self.libNavBar.changeMenu(0);
            }
        });
    }
    getVolumeclass(val){
        if(val==0){
            return "vx"
        }
        else if(val>0 && val<=33){
            return "v0"
        }
        else if(val>33 && val<=66){
            return "v1"
        }
        else if(val>66 && val<=100){
            return "v2"
        }
    }
    static createAudioCard(sourceMap){
        let card=$('<div class="card song"></div>');
        card.attr('songid',sourceMap.id);
        let imagecard=$('<div class="imagecard"></div>');
        // let image=$('<img>');
        let imgsrc="";
        if(sourceMap.image['500x500']){
            imgsrc=sourceMap.image['500x500'];
        }
        else if(sourceMap.image['150x150']){
            imgsrc=sourceMap.image['150x150'];
        }
        else if(sourceMap.image['50x50']){
            imgsrc=sourceMap.image['50x50'];
        }

        // image.attr('src',imgsrc);
        // imagecard.append(image);
        imagecard.css('background-image','url('+imgsrc+')')
        let songtitle=$('<div class="songtitle songinfo"></div>');
        songtitle.text(sourceMap.title);
        let songartist=$('<div class="songAuthor songinfo"></div>');
        songartist.text(sourceMap.artist);
        let lang=$('<div class="lang"></div>');
        lang.text(sourceMap.lang);
        card.append(lang);
        card.append(imagecard);
        card.append(songtitle);
        card.append(songartist);
        card.data('musicdata',sourceMap);
        $("#MusicCardWrapper").append(card);
    }
    static createAlbumCard(sourceMap){
        let card=$('<div class="card album"></div>');
        card.attr('albumId',sourceMap.albumid);
        let imagecard=$('<div class="imagecard"></div>');
        let image=$('<img>');
        let imgsrc="";
        if(sourceMap.image['500x500']){
            imgsrc=sourceMap.image['500x500'];
        }
        else if(sourceMap.image['150x150']){
            imgsrc=sourceMap.image['150x150'];
        }
        else if(sourceMap.image['50x50']){
            imgsrc=sourceMap.image['50x50'];
        }

        image.attr('src',imgsrc);
        imagecard.append(image);
        let Albumtitle=$('<div class="songtitle songinfo"></div>');
        Albumtitle.text(sourceMap.title);
        let Albumartist=$('<div class="songAuthor songinfo"></div>');
        Albumartist.text(sourceMap.artist);
        let lang=$('<div class="lang"></div>');
        lang.text(sourceMap.lang);
        card.append(lang);
        card.append(imagecard);
        card.append(Albumtitle);
        card.append(Albumartist);
        card.data('albumdata',sourceMap);
        $("#MusicCardWrapper").append(card);
    }
    populateSongResponse(resp,callable){
        let prosseddat=[];
        if(resp.status="SUCCESS"){
            let data=resp.data.results?resp.data.results:resp.data;
            $.each(data,function(index,songobject){
                let song={};
                song.title=songobject.name;
                song.jsvnurl=songobject.url;
                song.artist=songobject.primaryArtists;
                song.image={};
                song.id=songobject.id;
                if(typeof songobject.album == "object"){
                    song.albumid=songobject.album.id;
                    song.albumUrl=songobject.album.url;
                }else{
                    song.albumid=songobject.albumid;
                }
                song.downloadUrl={};
                song.lang=songobject.language;
                $.each(songobject.image,function(index,imageObj){
                    if(imageObj.link.startsWith('https')){
                        song.image[imageObj.quality]=imageObj.link;
                    }else{
                        song.image[imageObj.quality] = "https"+imageObj.link.slice(4)
                    }
                });
                $.each(songobject.downloadUrl,function(index,sdlObj){
                    song.downloadUrl[sdlObj.quality]=sdlObj.link;
                });
                // callable(song)
                if($(`[songid=${song.id}]`).length==0){
                    Kofiplayer.createAudioCard(song);
                }
                prosseddat.push(song);
            });
        }
    }
    populateAlbumResponse(resp,callable){
        let processedAlbum=[];
        if(resp.status="SUCCESS"){
            let data=resp.data.results?resp.data.results:resp.data;
            $.each(resp.data.results,function(index,albumObj){
                let album = {
                    albumid:albumObj.id,
                    title:albumObj.name,
                    lang:albumObj.language,
                    year:albumObj.year,
                    url:albumObj.url,
                    image:{},
                    artist:"",
                };
                $.each(albumObj.image,function(index,imageObj){
                    album.image[imageObj.quality]=imageObj.link;
                });
                
                $.each(albumObj.primaryArtists,function(index,artitsObj){
                    album.artist+=artitsObj.name;
                    if(index<albumObj.primaryArtists.length-1){
                        album.artist+=',';
                    }
                });
                // callable(album);
                if($(`[albumId=${album.albumid}]`).length==0){
                    Kofiplayer.createAlbumCard(album)
                }
            });
        }
    }
    populateSongFromAlbum(resp,callable){
        let processedAlbum=[];
        if(resp.status="SUCCESS"){
            let data={
                status:resp.status,
                data:{
                    results:resp.data.songs
                }
            };
            callable(data);
        }
    }
    populateFromAllSearch(resp,callableArray){
        let processedAlbum=[];
        if(resp.status="SUCCESS"){
            let songs={status:"SUCCESS"};
            let albums={status:"SUCCESS"};
            songs.data={
                results:resp.data.songs
            };
            albums.data={
                results:resp.data.albums
            };
            $.each(resp.data.songs.results,function(index,object){
                callableArray.getDetailsFromUrl(object.url,callableArray.songCard)
            });
            $.each(resp.data.albums.results,function(index,object){
                callableArray.getDetailsFromUrl(object.url,callableArray.albumCard)
            });

        }
    }
}

window.KofiPlayer = new Kofiplayer();
KofiPlayer.bindEvents();
