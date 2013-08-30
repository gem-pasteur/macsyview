  function loadFile(evt) {
    $('#contents').empty();
    var files = evt.target.files; // FileList object
    var chunkSize = 20000;
    for (var i = 0, f; f = files[i]; i++) {
      var fileSize = f.size;
      $("#progress").attr('max',fileSize);
      $("#progress").attr('value',0);
      function readBlob(file, offset) {
        var stop = offset+chunkSize-1;
        if (stop>(fileSize-1)){stop = fileSize - 1};
        var reader = new FileReader();
        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            $('#contents').append(evt.target.result);
            $("#progress").attr('value',stop);
            if(stop<fileSize-1){
              offset = offset + chunkSize;
              evt = null;
              //$('.progress-label').text('loading ('+offset+'/'+fileSize+')...');
              readBlob(file, offset);
            }else{
              //$('.progress-label').text('file loaded!');
            }
          }
        };
        var blob = file.slice(offset, stop + 1);
        reader.readAsBinaryString(blob);
      }
      readBlob(f,0);
    }
  }
  document.getElementById('files').addEventListener('change', loadFile, false);

