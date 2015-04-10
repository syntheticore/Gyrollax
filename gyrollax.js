var TiltProvider = function() {
  var smoothRef = 0.988;

  var refAlpha;
  var refBeta;

  var lastAlpha;
  var stableAlpha;

  var landscape = false;

  var debug = false;

  var listener;

  return {
    start: function(cb) {
      window.addEventListener("orientationchange", function(e) {
        landscape = (window.orientation != 0);
        if(debug) $('#landscape').text(landscape);
      });
      listener = function(e) {
        if(!e.webkitCompassHeading) return; // Compass takes a second to init
        if(!e.alpha) return;
        if(!e.beta) return;
        if(!e.gamma) return;

        var alpha = 360 - e.webkitCompassHeading;
        var beta = landscape ? -e.gamma : e.beta;
        var gamma = landscape ? e.beta : e.gamma;

        if(lastAlpha == undefined) {
          lastAlpha = alpha;
          stableAlpha = alpha;
          refAlpha = alpha;
          refBeta = beta;
        } else {
          // 0 -> 360
          if(lastAlpha - alpha < -180) {
            stableAlpha -= lastAlpha + (360 - alpha);
          // 360 -> 0
          } else if(lastAlpha - alpha > 180) {
           stableAlpha += (360 - lastAlpha) + alpha;
          // Regular movement
          } else {
            stableAlpha += alpha - lastAlpha;
          }
          lastAlpha = alpha;

          refAlpha = refAlpha * smoothRef + stableAlpha * (1 - smoothRef);
          refBeta = refBeta * smoothRef + beta * (1 - smoothRef);

          var diffAlpha = stableAlpha - refAlpha;
          var diffBeta = beta - refBeta;
          var uprightness = Math.abs(beta) / 90;
          var tilt = ((gamma / 360) + (diffAlpha / 360 / 2)) * (1 - uprightness) + (diffAlpha / 360) * uprightness;

          cb(tilt, diffBeta / 360);

          if(debug) {
            $('#alpha').text(alpha); // 0 - 360
            $('#beta').text(beta);   // 0 - 90, 0 - -90
            $('#gamma').text(gamma); // 0 - -180, 0 - 180
            $('#compass').text(e.webkitCompassHeading);
            $('#stable-alpha').text(stableAlpha);
            $('#refAlpha').text(refAlpha);
            $('#refBeta').text(refBeta);
            $('#diffAlpha').text(diffAlpha);
            $('#diffBeta').text(diffBeta);
            $('#uprightness').text(uprightness);
            $('#tilt').text(tilt);
          }
        }
      };
      window.addEventListener("deviceorientation", listener);
    },

    stop: function() {
      window.removeEventListener(listener);
    }
  }
};

var SmoothTiltProvider = function() {
  var smooth = 0.5;
  var running = false;

  var tiltX;
  var tiltY;

  var x = 0;
  var y = 0;

  var provider = TiltProvider();

  return {
    start: function(cb) {
      provider.start(function(tx, ty) {
        tiltX = tx;
        tiltY = ty;
      });
      running = true;
      var step = function() {
        if(tiltX != undefined) {
          x = x * smooth + tiltX * (1 - smooth);
          y = y * smooth + tiltY * (1 - smooth);
          cb(x,y);
        }
        if(running) {
          window.requestAnimationFrame(step)
        }
      };
      window.requestAnimationFrame(step);
    },

    stop: function() {
      running = false;
      provider.stop();
    }
  }
};

var gyrollaxify = function() {
  var elems = $('[data-z]').get();
  var zValues = _.map(elems, function(elem) {
    elem.style.webkitTransform = 'translate(0px, 0px)';
    return parseFloat(elem.attributes['data-z'].value);
  });
  var backElems = $('[data-back-z]').get();
  $(backElems).each(function() {
    var z = -parseFloat(this.attributes['data-back-z'].value);
    $(this).css({
      'background-size': 'calc(100% + ' + (2 * z) + 'px)',
      'background-position': '-' + z + 'px -' + z + 'px'
    });
  });
  var backZValues = _.map(backElems, function(elem) {
    return -parseFloat(elem.attributes['data-back-z'].value);
  });
  var provider = SmoothTiltProvider();
  provider.start(function(tx, ty) {
    for(var i = 0; i < elems.length; i++) {
      var elem = elems[i];
      var z = zValues[i];
      //- elem.style.position = 'relative';
      //- elem.style.left = tx * z + 'px';
      //- elem.style.top = ty * z + 'px';
      elem.style.webkitTransform = 'translate(' + (tx * z) + 'px, ' + (ty * z) + 'px)';
    }
    for(var i = 0; i < backElems.length; i++) {
      var elem = backElems[i];
      var z = backZValues[i];
      var x = -tx * z - z;
      var y = -ty * z - z;
      elem.style.backgroundPosition = '' + x + 'px ' + y + 'px';
    }
  });
};


if(typeof(window) == 'undefined') {
  module.exports = {
    gyrollaxify: gyrollaxify,
    TiltProvider: TiltProvider,
    SmoothTiltProvider: SmoothTiltProvider
  };
}
