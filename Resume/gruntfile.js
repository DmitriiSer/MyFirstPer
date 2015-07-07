module.exports = function(grunt) {
    grunt.registerTask('default', ['watch']);
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.initConfig({
        copy: {
            main: {
                files: {
                    'scripts.js': ['js/scripts.js']
                } //files
            }
        }, //copy
        uglify: {
            my_target: {
                files: {
                    'scripts.js': ['js/scripts.js']
                } //files
            } //my_target
        }, //uglify
        compass: {
            dev: {
                options: {
                    config: 'config.rb'
                } //options
            } //dev
        }, //compass
        watch: {
            options: { livereload: true },
            html: {
                files: ['*.html']
            }, //html
            sass: {
                files: ['sass/*.scss'],
                tasks: ['compass:dev']
            }, //sass
            scripts: {
                files: ['js/*.js'],
                tasks: ['copy']//['uglify']
            } //scripts
        } //watch
    }) //initConfig
} //exports