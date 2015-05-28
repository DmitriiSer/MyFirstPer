module.exports = function(grunt) {
    grunt.registerTask('default', ['watch']);
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.initConfig({
        uglify: {
            my_target: {
                files: {
                    'scripts.js': ['js/*.js']
                } //files
            } //my_target
        }, //uglify
        watch: {
            options: { livereload: true },
            /*html: {
                files: ['*.html']
            }, //html*/
            scripts: {
                files: ['js/*.js'],
                tasks: ['uglify']
            } //scripts
        } //watch
    }); //initConfig
} //exports