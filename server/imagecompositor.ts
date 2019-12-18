var exec = require('child_process').exec

class ImageCompositor {

  public constructor() {

  }

  public composite(): void {
    var command = [
      'composite',      
      'src/assets/templates/overlay.png',
      'src/assets/stockphoto.jpg', //input
      '-gravity', 'north',
      '-geometry', '+0+40', 
      'built/test.jpg'  //output
      ];

    exec(command.join(' '), function(err, stdout, stderr) { 
      if (err) throw err
      console.log(err);
    });

    /*
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
    */
    return;
  }

 
}

export { ImageCompositor }
