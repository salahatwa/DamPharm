# DamPharm
Store Management System build with Angularjs 4 and Spring boot  

# Build application
 - npm run build
 
*Note*: I'm working on version 2 of this guide and I need your help! Please use [this form to give me feedback](https://goo.gl/forms/yoWihX9ZjPI9x24o1) on what you think should go in the next version. Thanks!


## Table Of Contents

* [Requirements](#requirements)
* [Building Application](#building)
* [Deploy Appliation](#deploy)
 

## Requirements
* Front end
   * [NodeJs](https://nodejs.org/en/) - The web framework used
   * [Angular CLI](https://cli.angular.io/) - A command line interface for Angular
* Backend
   * [Java 8](http://www.oracle.com/technetwork/java/javase/overview/java8-2100321.html) - The Java Version used
   * [Spring boot](https://projects.spring.io/spring-boot/) - The backend framework used
   * [Maven](https://maven.apache.org/) - Dependency Management
   * [MySQL](https://maven.apache.org/) - DataBase Management System



### Building

* Developer Mode
   * ``` mvn spring-boot:run ```   for backend project
   * ``` ng serve -dev  ```         for front end project
* Production Mode
   * ``` mvn spring-boot:run ```


#### Deploy

Deploy Steps

Add this line at STS.ini

-vm 
C:\Program Files\Java\jdk1.8.0_112\bin\javaw.exe