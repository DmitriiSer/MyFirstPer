var app = angular.module("Resume",[])
.controller("BadgeController", ["$scope", function($scope) {
    $scope.data = [
        {
            col: [
                {
                    name: "Languages",
                    size: 96,
                    badges: [
                        { title: "Java",        href: "http://www.oracle.com/technetwork/java/javase/overview/index.html" },
                        { title: "C++",         href: "http://www.cplusplus.com/" },
                        { title: "HTML5",       href: "http://www.w3.org/html/" },
                        { title: "CSS3",        href: "http://www.w3.org/Style/CSS/" },
                        { title: "JavaScript",  href: "http://en.wikipedia.org/wiki/JavaScript" }
                    ]
                },
                {
                    name: "Frameworks & Libraries",
                    size: 64,
                    width: 200,
                    badges: [
                        { title: "AngularJS",   href: "https://angularjs.org/" },
                        { title: "Ionic",       href: "http://ionicframework.com/" },
                        { title: "jQuery",      href: "https://jquery.com/" },
                        { title: "Velocity.js", href: "http://julian.com/research/velocity/", no_image: true }
                    ]
                }
            ]
        },
        {
            col: [
                {
                    name: "IDEs",
                    colspan: 1,
                    size: 72,
                    width: 200,
                    badges: [
                        { title: "NetBeans",                href: "https://netbeans.org/" },
                        { title: "Visual Studio",           href: "https://www.visualstudio.com", image: "images/visualstudio.png" },
                        { title: "Eclipse",                 href: "https://eclipse.org/" }                        
                    ]
                }
            ]
        },
        {
            col: [
                {
                    name: "Familiar",
                    colspan: 2,
                    size: 96,
                    shape: "square",
                    badges: [
                        { title: "OOP",                     href: "http://en.wikipedia.org/wiki/Object-oriented_programming", tooltip: "Object Oriented Principles", no_image: true },
                        { title: "MySQL",                   href: "https://www.mysql.com" },
                        { title: "SQL Server",              href: "https://en.wikipedia.org/wiki/Microsoft_SQL_Server", image: "images/mssql.png", tooltip: "Microsoft SQL Server" },
                        { title: "Design Patterns",         href: "https://en.wikipedia.org/wiki/Software_design_pattern", no_image: true },
                        { title: "Windows",                 href: "http://www.microsoft.com/windows/" },
                        { title: "Mac OS X",                href: "http://www.apple.com/osx/", image: "images/macosx.png" },
                        { title: "Linux",                   href: "https://en.wikipedia.org/wiki/Linux" },
                        { title: "Git",                     href: "https://git-scm.com/" },
                        { title: "GitHub",                  href: "https://github.com/DmitriiSer/" }
                    ]
                }
            ]
        }
    ];
    $scope.backgroundStyle = function(badge) {
        if (badge.no_image) {
            return "";
        }
        else {
            var img = (badge.image === undefined) ? 'images/' + badge.title + '.png' : badge.image;
            return "background-image: url(" + img + ")";
        }
    };
    $scope.imageSrc = function(badge) {
        if (badge.no_image)
            return "";
        if (badge.image === undefined) {
            return "images/" + badge.title + ".png";
        } else {
            return badge.image;
        }
    };
}])
.controller("ProjectsController", ["$scope", function($scope) {
    $scope.techTitles = ["Languages", "Frameworks & Libraries", "IDEs", "DBs"];
    $scope.data = [
        {
            title: "Lister",
            link: "https://github.com/DmitriiSer/Lister",
            tooltip: "Go To GitHub Project Page",
            description: "This project is a try to create an application that would find cheapest flights around the world using different search engines (e.g Expedia, RyanAir, etc.). Is consist of 2 parts: the server and the client. The server receives request from client app and pushs/fetches entries to DB which is MySQL instance. The client is a desktop applcation to provide UI to users.",
            techs: {
                langs: [
                    { title: "HTML5" },
                    { title: "CSS3" },
                    { title: "JavaScript" },
                    { title: "Java" }
                ],
                libs: [
                    { title: "AngularJS" },
                    { title: "Ionic" },
                    { title: "Bootstrap" },
                    { title: "UI Bootstrap", no_image: true },
                    { title: "Font Awesome", image: "images/font_awesome.png" },
                    { title: "Velocity.js", no_image: true },
                    { title: "CryptoJS (SHA-3)", image: "images/CryptoJS.png" },
                    { title: "OpenShift" }
                ],
                ides: [{ title: "NetBeans" }],
                dbs: [{ title: "MySQL" }]
            }
        },
        {
            title: "AdvancedCarousel",
            link: "https://github.com/DmitriiSer/WebProjects/tree/master/AdvancedCarousel",
            tooltip: "Go To GitHub Project Page",
            description: "Representation of an image carousel",
            techs: {
                langs: [
                    { title: "HTML5" },
                    { title: "CSS3" },
                    { title: "JavaScript" }
                ],
                libs: [
                    { title: "jQuery" },
                    { title: "jQuery-UI" },
                    { title: "Velocity.js", no_image: true },
                ],
                ides: [{ title: "Adobe Brackets 1.3.0", image: "images/brackets.png" }]
            }            
        },
        {
            title: "Foodnetwork Recipe to Cozi Meals (Google Chrome/Opera Extension)",
            link: "https://github.com/DmitriiSer/WebProjects/tree/master/Chrome%20Extensions/Foodnetwork%20Recipe%20to%20Cozi%20Meals",
            tooltip: "Go To GitHub Project Page",
            description: "Chrome/Opera extension that allows to transfer the whole recipe from Foodnetwork recipe page to Cozi Meals recipe by pressing a button in popup window of the extension",
            techs: {
                langs: [
                    { title: "HTML5" },
                    { title: "CSS3" },
                    { title: "JavaScript" }
                ],
                libs: [],
                ides: [{ title: "Adobe Brackets 1.3.0", image: "images/brackets.png" }]
            }
        },
        {
            title: "Resume",
            link: "https://github.com/DmitriiSer/WebProjects/tree/master/Resume",
            tooltip: "Go To GitHub Project Page",
            description: "Animated version of this resume",
            techs: {
                langs: [
                    { title: "HTML5" },
                    { title: "CSS3" },
                    { title: "JavaScript" }
                ],
                libs: [
                    { title: "jQuery" },
                    { title: "jQuery-UI" },
                    { title: "AngularJS" },
                    { title: "Velocity.js", no_image: true },
                ],
                ides: [{ title: "Adobe Brackets 1.3.0", image: "images/brackets.png" }],
            }            
        },
        {
            title: "CheapFly",
            description: "This project is a try to create an application that would find cheapest flights around the world using different search engines (e.g Expedia, RyanAir, etc.). Is consist of 2 parts: the server and the client. The server receives request from client app and pushs/fetches entries to DB which is MySQL instance. The client is a desktop applcation to provide UI to users",
            techs: {
                langs: [{ title: "C++/CLI (.NET)", no_image: true }],
                libs: [{ title: "Boost (ASIO)", image: "images/boost_asio.png" }],
                ides: [{ title: "Visual Studio", image: "images/visualstudio.png" }],
                dbs: [{ title: "MySQL" }],
            }
        },
        {
            title: "AELS Sniffer",
            description: "Simple network traffic analyzer",
            techs:{
                langs: [{ title: "C++" }],
                libs: [{ title: "WinPcap", no_image: true }],
                ides: [{ title: "Borland C++ Builder 5/6", image: "images/bcb6.png" }]
            }
        },
        {
            title: "Tetraedroid",
            description: "Compound of 2 tetrahedra spining around it's different axis. Made on Windows using Visual C++ and DriectX APIs",
            techs:{
                langs: [{ title: "C++/CLI (.NET)", no_image: true }],
                libs: [{ title: "DirectX (Direct3D)", image: "images/directx.png" }],
                ides: [{ title: "Visual Studio", image: "images/visualstudio.png" }]
            }
        },
        {
            title: "PDFToXLS",
            description: "Application that allowes to create XLS spreadsheet file from PDF using an online service. Basicaly it creates HTTPRequests to that web service, uploads a file and gets the result file back",
            techs:{
                langs: [{ title: "C++/CLI (.NET)", no_image: true }],
                libs: [],
                ides: [{ title: "Visual Studio", image: "images/visualstudio.png" }]
            }
        }
    ];
    $scope.imageSrc = function(obj) {
        if (obj.no_image)
            return "";
        if (obj.image === undefined) {
            return "images/" + obj.title + ".png";
        } else {
            return obj.image;
        }
    };
}]);