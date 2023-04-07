# Student-service
Full stack web application made using angular and nodeJS

Components:

Login - Used for user login. The user needs to log in to be able to access components other than registration.
Registration - Korsinkik can be registered here. After successful registration, the user is assigned level 2. Users can be level 1 (administrator and teacher) and 2 (teacher).
Main- This component displays all data. If the user is level 2, only the data that is important to him is displayed. A level 1 user can add new students and courses here, delete students and courses, exchange students and courses, and change the level of other users to administrator.
details- Displays data in three different ways. attached by teachers, courses and students.
edit - Shows the selected student, teacher or course. Data that cannot be changed in the main component can be changed through this component.
navbar - Navigation component.

Additionally:

filter pipe: A pipe created for filtering data.
AuthenticationGuard: Protects against unauthorized access.
AuthInterceptor: Adds a token to the request.
MainService, userService and authService - Used for communication with the server.

Back end:
api- Protected by token. It is used to retrieve, modify, delete and add data for all components except login and registration.
authenticate- Used to retrieve and add users to the login and registration component.

"prezentacijazagithub.mp4" is a video presentation of the app.
