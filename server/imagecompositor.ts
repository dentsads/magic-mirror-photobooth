const gm = require('gm').subClass({imageMagick: true});

class ImageCompositor {

  public constructor() {

  }

  public composite(): void {
    gm()
    //.command("composite")    
    .in('-gravity', 'north')
    .in('src/assets/stockphoto.jpg')
    .in('-geometry', '+0+40')
    .in('src/assets/templates/overlay.png')
    .mosaic()
    .write('built/test.jpg', function (err) {
      if (err) throw err
      console.log(err);
    });

    return;
  }

 
}

export { ImageCompositor }
