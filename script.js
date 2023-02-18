class JioSaavanApi{
    constructor(){
        this.apiDomain='https://kofiplayer-saavn.vercel.app/';
        this.searchbar=$("#Searchbar");
    }
    SearchAll(){
        // https://saavn.me/search/all?query=imagine+dragons
    }
    searchSongs(callback,afterCall){
        let query=this.searchbar.val();
        query=query.replace(/\s/g,"+");
        let url=this.apiDomain+`search/songs?query=${query}&page=1&limit=10`
        this.getData(url,callback,function(resp){console.log(resp)},afterCall);
    }
    getData(url,sucessCallback,failureCallBack,afterCall){
        $.ajax(
        {
            url:url,
            type:'GET',
            dataType:'json',
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
class Kofiplayer{
    constructor(){
        let self = this;
        this.AudioPlayer= new Audio();
        this.Api=new JioSaavanApi();
        this.currentAudioname="";
        this.volume=this.AudioPlayer.volume;
        this.muted=this.AudioPlayer.muted;
        this.playlist=[];
        this.audioSrc="";

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
        let self=this;
        self.Api.searchbar.on('change',function(event){
            self.Api.searchSongs(self.populateSongResponse,self.createAudioCard);
        });
        audioPlayer.on('play',function(event){

        });
        audioPlayer.on('pause',function(event){

        });
        audioPlayer.on('timeupdate',function(event){
            self.currentTime.text(self.constructTime(self.AudioPlayer.currentTime));
            self.seekBar.val(Math.floor(self.AudioPlayer.currentTime/self.AudioPlayer.duration)*100);
        });
        audioPlayer.on('loadedmetadata',function(event){
            self.currentTime.text(self.constructTime(self.AudioPlayer.currentTime));
            self.duration.text(self.constructTime(self.AudioPlayer.duration));
        });
        audioPlayer.on('ended',function(event){
            if(self.AudioPlayer.autoplay){
                // seekNextSrc();
            }
        });

        audioPlayer.on('volumechange',function(event){
            //for keybinds
        });
        self.Volumeslider.on('input',function(event){
            self.AudioPlayer.volume=(self.Volumeslider.val()/100);
        });
        self.seekBar.on('change',function(event){

        });
        self.seekBar.on('input',function(event){
            //cancel animation frames
            // currentTimeContainer.textContent = calculateTime(seekSlider.value);
            // if(!audio.paused) {
            // cancelAnimationFrame(raf);
            // }
        });
        self.MusicCardWrapper.on('click',function(event){
            let card=$(event.target).closest('.card');
            if(card.length){
                let source=card.data('musicdata');
                //set audio;
                self.AudioPlayer.pause()
                try{
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
                    self.AudioPlayer.play();
                    self.coverArt.attr('src',$("img",card).attr('src'));
                    self.songTitle.text(source.title);
                    self.songartist.text(source.artist);
                }
                catch(err){
                    console.log('load error',err)
                }
            }
        });
    }
    createAudioCard(sourceMap){
        let card=$('<div class="card"></div>');
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
        let songtitle=$('<div class="songtitle songinfo"></div>');
        songtitle.text(sourceMap.title);
        let songartist=$('<div class="songAuthor songinfo"></div>');
        songartist.text(sourceMap.artist);
        card.append(imagecard);
        card.append(songtitle);
        card.append(songartist);
        card.data('musicdata',sourceMap);
        $("#MusicCardWrapper").append(card);
    }

    populateSongResponse(resp,callable){
        let prosseddat=[];
        if(resp.status="SUCCESS"){
            $.each(resp.data.results,function(index,songobject){
                let song={};
                song.title=songobject.name;
                song.jsvnurl=songobject.url;
                song.artist=songobject.primaryArtists;
                song.image={};
                song.downloadUrl={};
                $.each(songobject.image,function(index,imageObj){
                    song.image[imageObj.quality]=imageObj.link;
                });
                $.each(songobject.downloadUrl,function(index,sdlObj){
                    song.downloadUrl[sdlObj.quality]=sdlObj.link;
                });
                callable(song)
            });
        }
    }
}

let Aud = new Kofiplayer();
Aud.bindEvents();