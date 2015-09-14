var yuma = {
  mashups: {
    fligle: function (apiKey, userId, photosetId, mapCanvas) {
      var sizeSuffixes = [[100, 't'], [240, 'm'], [320, 'n'], [640, 'z'], [800, 'c'], [1024, 'b']];

      var map = new google.maps.Map(document.getElementById("map-canvas"));
      var activeMarker;
      var infoWindow = new google.maps.InfoWindow({
        content: ""
      });

      $.getJSON(
        "https://api.flickr.com/services/rest/?jsoncallback=?",
        {
          method: "flickr.photosets.getPhotos",
          api_key: apiKey,
          photoset_id: photosetId,
          user_id: userId,
          extras: "geo",
          format: "json"
        },
        onGetPhotos
      );

      function onGetPhotos(rsp) {
        if (rsp.stat != "ok") {
          return;
        }

        var photos = rsp.photoset.photo;

        var bounds = {
          ne: {lat: -90.0, lng: -180.0},
          sw: {lat: 90.0, lng: 180.0}
        };

        for (var i = 0; i < photos.length; i++) {
          var photo = photos[i];
          var lat = parseFloat(photo.latitude);
          var lng = parseFloat(photo.longitude);

          //compute bounds
          bounds.ne.lat = Math.max(bounds.ne.lat, lat);
          bounds.ne.lng = Math.max(bounds.ne.lng, lng);
          bounds.sw.lat = Math.min(bounds.sw.lat, lat);
          bounds.sw.lng = Math.min(bounds.sw.lng, lng);

          var marker = new google.maps.Marker({
            position: {lat: lat, lng: lng},
            map: map,
            title: photo.title,
            photoId: photo.id,
            photoSecret: photo.secret
          });

          google.maps.event.addListener(marker, "click", function(){
            activeMarker = this;
            $.getJSON(
              "https://api.flickr.com/services/rest/?jsoncallback=?",
              {
                method: "flickr.photos.getInfo",
                api_key: apiKey,
                photo_id: this.photoId,
                secret: this.photoSecret,
                format: "json"
              },
              openInfoWindow
            );
          });
        }
        map.fitBounds(new google.maps.LatLngBounds(bounds.sw, bounds.ne));
      }

      function openInfoWindow(rsp) {
        if (rsp.stat != "ok") {
          return;
        }

        var photo = rsp.photo;

        infoWindow.setContent('<div><img src="https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_' + getSizeSuffix() + '.jpg"></img><br>' + photo.title._content + '</div>');
        infoWindow.open(map, activeMarker);
      }

      function getSizeSuffix() {
          var sizeSuffix = 't';
          var imageLongestSide = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight);
          for (var i = 0; i < sizeSuffixes.length && imageLongestSide > sizeSuffixes[i][0]; i++) {
            sizeSuffix = sizeSuffixes[i][1];
          }
          return sizeSuffix;
      }
    }
  }
}
