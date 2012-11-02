$(function() {
    Parse.initialize("MtHL0itQ4X1oGnXcf9MZ5G7XOBRYnT48aRhZY2oc", "2C7NtxKWnmc536C2KA2qDOlxSlSxDSMjsjcfCJN2");
        
    //var TestObject = Parse.Object.extend("TestObject");
    //var testObject = new TestObject();
    
    window.socket = io.connect();
    window.socket.on('chat', function(data) {
        $('#chat').append($('<li>' + (data.name || 'Anonymous') + ': ' + data.message + '</li>'));
        //console.log('message chat:', data)
    });
    
    $('#send').keyup(function(event) {
        if (event.keyCode === 13 || event.keyCode === 10) {
            if ($('#name').val()) {
                window.socket.emit('chat', {name: $('#name').val(), message: $(this).val()});
            } else {
                window.socket.emit('chat', {message: $(this).val()});
            }
            $(this).val('');
        }
    });
    
    /*
    testObject.save({foo: "bar"}, {
        success: function(object) {
            $(".success").show();
        },
        error: function(model, error) {
            $(".error").show();
        }
    });
    */
});