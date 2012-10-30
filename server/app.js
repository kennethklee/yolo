$(function() {
    Parse.initialize("MtHL0itQ4X1oGnXcf9MZ5G7XOBRYnT48aRhZY2oc", "2C7NtxKWnmc536C2KA2qDOlxSlSxDSMjsjcfCJN2");
        
    var TestObject = Parse.Object.extend("TestObject");
    var testObject = new TestObject();
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