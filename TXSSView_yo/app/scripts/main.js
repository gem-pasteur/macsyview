function loadFile(evt) {
    $('#contents').empty();
    var files = evt.target.files; // FileList object
    var chunkSize = 20000;
    for (var i = 0, f; f = files[i]; i++) {
        var fileSize = f.size;
        $("#progress").attr('max', fileSize);
        $("#progress").attr('value', 0);

        function readBlob(file, offset) {
            var stop = offset + chunkSize - 1;
            if (stop > (fileSize - 1)) {
                stop = fileSize - 1
            };
            var reader = new FileReader();
            // If we use onloadend, we need to check the readyState.
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    $('#contents').append(evt.target.result);
                    $("#progress").attr('value', stop);
                    if (stop < fileSize - 1) {
                        offset = offset + chunkSize;
                        evt = null;
                        //$('.progress-label').text('loading ('+offset+'/'+fileSize+')...');
                        readBlob(file, offset);
                    } else {
                        //$('.progress-label').text('file loaded!');
                    }
                }
            };
            var blob = file.slice(offset, stop + 1);
            reader.readAsBinaryString(blob);
        }
        readBlob(f, 0);
    }
}

var output = $("#contents");

var listSystemMatchFiles = function (files) {
    var systemMatchRE = /([A-Za-z0-9]+)_([A-Za-z0-9]+)_([A-Za-z0-9]+)\.json/;
    var systemMatchFiles = [];
    for (var i = 0, len = files.length; i < len; i++) {
        file = files[i];
        var match = systemMatchRE.exec(file.name)
        if (match) {
            systemMatchFiles.push({
                'file': file,
                'replicon_name': match[1],
                'system_name': match[2],
                'occurence_number': match[3],
                'id':file.name
            });
        }
    }
    return systemMatchFiles;
}

var displaySystemMatchFileDetail = function(){
}

var initSystemMatchSelectionHandler = function (systemMatchFiles) {
    $(".txsview-systemmatchtablerow td").click(function(e){
        var id = $(e.currentTarget).parent().attr('data-systemmatchid');
        var selectedSystemMatchFile = systemMatchFiles.filter(function(systemMatchFile){
            return systemMatchFile.id == id;
        })[0];
        displaySystemMatchFileDetail(selectedSystemMatchFile);
    });
}

var directorySelectionHandler = function (e) {
    output.innerHTML = "";
    var files = e.target.files;
    var systemMatchFiles = listSystemMatchFiles(files);
    var template = '<table class="table table-hover tab-striped"><tr><th>Replicon Name</th><th>System Name</th><th>Occurence No.</th></tr>{{#files}}<tr class="txsview-systemmatchtablerow" data-systemmatchid="{{id}}"><td>{{replicon_name}}</td><td>{{system_name}}</td><td>{{occurence_number}}</td></tr>{{/files}}</table>';
    output.html(Mustache.render(template, {
        'files': systemMatchFiles
    }));
    initSystemMatchSelectionHandler(systemMatchFiles);
}

$('#directory').change(directorySelectionHandler);