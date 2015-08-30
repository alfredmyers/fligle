  var api_key = "5516573a7093945b52b58bf2eccf678c";
  var sizeSuffixes = [[100, 't'], [240, 'm'], [320, 'n'], [640, 'z'], [800, 'c'], [1024, 'b']];

  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  var activeMarker;
  var infoWindow = new google.maps.InfoWindow({
    content: ""
  });

  function jsonFlickrApi(rsp) {
    if (rsp.stat != "ok") {
      return;
    }

    var photos = rsp.photoset.photo;

    for (var i = 0; i < photos.length; i++) {
      var photo = photos[i];

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(photo.latitude, photo.longitude),
        map: map,
        title: photo.title,
        photoId: photo.id,
        photoSecret: photo.secret
      });

      google.maps.event.addListener(marker, "click", function(){
        activeMarker = this;
        runJsonp("https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + api_key + "&photo_id=" + this.photoId + "&secret=" + this.photoSecret + "&format=json&jsoncallback=openInfoWindow");
      });
    }
  }

  function openInfoWindow(rsp) {
    if (rsp.stat != "ok") {
      return;
    }

    var photo = rsp.photo;

    infoWindow.setContent('<div><img src="https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_' + getSizeSuffix() + '.jpg"></img><br>' + photo.title._content + '</div>');
    infoWindow.open(map, activeMarker);
  }

  function runJsonp(src){
    var script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);
    document.body.removeChild(script);
  }

  function getSizeSuffix() {
      var sizeSuffix = 't';
      var imageLongestSide = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight);
      for (var i = 0; i < sizeSuffixes.length && imageLongestSide > sizeSuffixes[i][0]; i++) {
        sizeSuffix = sizeSuffixes[i][1];
      }
      return sizeSuffix;
  }

  runJsonp("https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + api_key + "&photoset_id=" + photoset_id + "&user_id=" + user_id + "&extras=geo&format=json");
