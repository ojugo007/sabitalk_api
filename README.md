# 📘 SABITALK API Documentation

**SABITALK** is a web application designed to help users learn their native languages through an engaging and personalized experience. The platform supports multiple languages and provides structured learning paths tailored to individual preferences.

This documentation covers the **authentication and user onboarding endpoints**, which are the foundation for accessing the app. These routes allow users to:

- Select a language they wish to learn
- Sign up for an account
- Log in securely

> ⚠️ **Note**: This document focuses only on the authentication flow. Additional endpoints for learning content and language progression will be documented as the app evolves.


---

## 🌍 1. Select Language

### `POST /select-language`

Selects the language the user wants to learn. This must be called **before signup**, and the selection is stored in the session.

### 🔸 Request Body

```
{
  "language": "yoruba"
}
```
###🔹 **Success Response**
```
{
  "message": "successfully selected yoruba"
}
```
###🔹 **Error Response**
```
{
  "message": "you have to select a language"
}
```
## 📝 2. Sign Up

### `POST /auth/signup`

Registers a new user. Requires that the user has selected a language via `/select-language`, and has accepted the terms and conditions.

### 🔸 Request Body


```
{  
	"email":  "johndoe@gmail.com",
	"password":  "johnDoe@13",  
	"termsAccepted":  true 
}
``` 

> 🔐 **Password requirements:**
> 
> -   Minimum 8 characters
>     
> -   At least one uppercase letter
>     
> -   At least one lowercase letter
>     
> -   At least one number
>     
> -   At least one special character
>     

### 🔹 Success Response

```
{
  "code": 201,
  "success": true,
  "data": {
    "user": {
      "_id": "user_id_here",
      "email": "johndoe@gmail.com",
      "language": "yoruba"
    },
    "token": "jwt_token_here"
  },
  "message": "signed up successfully"
}
``` 

### 🔹 Error Responses

**Missing Language in Session:**

```
{
  "code": 400,
  "success": false,
  "message": "Language not selected in session"
}
``` 

**Email Already Exists:**

```
{
  "code": 409,
  "success": false,
  "message": "Email already exists"
}
``` 


----------

## 🔐 3. Log In

### `POST /auth/login`

Authenticates an existing user and returns a JWT token if successful.

### 🔸 Request Body

```
{  
	"email":  "johndoe@gmail.com",
	"password":  "johnDoe@13" 
}
``` 

### 🔹 Success Response

```
{
  "code": 201,
  "success": true,
  "data": {
    "user": {
      "_id": "user_id_here",
      "email": "johndoe@gmail.com",
      "language": "yoruba"
    },
    "token": "jwt_token_here"
  },
  "message": "login successful"
}
``` 

### 🔹 Error Response


```
{  
	"code":  400,  
	"success":  false,  
	"message":  "Invalid email or password"  
}
``` 

----------

## ⚙️ Technical Notes

-   All requests and responses are in JSON.
    
-   Cookie-based session is used for storing selected language.
    
-   Make sure the frontend sends requests with credentials (cookies):
    
    -   `credentials: "include"` in `fetch`
        
    -   `withCredentials: true` in `axios`
        
-   CORS must allow credentials if frontend and backend are on different domains.
    

----------
## 🔐 Password Reset Flow 

This flow uses **sessions** to securely track the email across OTP verification and password reset. The user only inputs their email once (at the beginning), and it's managed in the session for subsequent steps.

----------

### **1. Request OTP (Reset Password)**

**Endpoint:** `POST auth/reset-password`  
**Description:** Sends an OTP to the user's email. Email is required in this step.

#### ✅ Request Body:

```
{  
	"email":  "johndoe@example.com  
}
``` 

#### 📤 Expected Response:

```
{  
	"code":200,  
	"success":true,  
	"message":"your otp has been sent to user@example.com",
	"data":  null  
 }
``` 

#### ❌ Possible Errors:

-   400 – Missing email
    
-   404 – Account with the email does not exist
    
-   500 – Email sending or server error
    

----------

### **2. Verify OTP**

**Endpoint:** `POST auth/verify-otp`  
**Description:** Validates the OTP.  
**ℹ️ Note:** The **email is retrieved from the session**, not passed in the request body.

#### ✅ Request Body:

```
{  
	"otp":123456
}
``` 

#### 📤 Expected Response:

```
{  
	"code":200,  
	"success":true,  
	"message":"otp verification was successful",
	"data":null  
}
``` 

#### ❌ Possible Errors:

-   400 – Missing OTP or invalid OTP
    
-   400 – OTP expired
    
-   500 – Server error
    

----------

### **3. Set New Password**

**Endpoint:** `POST auth/reset/new-password`  
**Description:** Sets a new password for the user.  
**ℹ️ Note:** The **email is retrieved from the session**, not passed in the request.

#### ✅ Request Body:

```
{
	"password":"NewSecurePassword123!"
}
``` 

#### 📤 Expected Response:


```
{  
	"code":200,  
	"success":true,  
	"message":"password reset was successful",  
	"data": userData
}
``` 

#### ❌ Possible Errors:

-   400 – Missing password
    
-   401 – OTP not verified (session missing or expired)
    
-   404 – User not found
    
-   500 – Server error
    

----------

## 🛠 Example Frontend Flow

1.  `POST /select-language` → store `language` in session
    
2.  `POST /auth/signup` → send email, password, and `termsAccepted`
    
3.  `POST /auth/login` → log in with email and password

4.  `POST /auth/reset-password` → send email and otp is generated by server and sent to user email

5.  `POST /auth/verify-otp` → send the otp retrieved from email

6.  `POST /auth/reset/new-password` → send the new password


## 🔐 Google OAuth Authorization

This section explains how to authenticate users via Google OAuth. This flow allows users to either **sign up or log in** using their Google account. A JWT token is issued on success and stored in a secure `httpOnly` cookie.

----------

### 📌 Step-by-Step Flow

----------

### 1. **Select Language**

Before redirecting the user to Google, the frontend must call this endpoint to store the user's preferred language in the session.

**Endpoint:**

`POST /select-language` 

**Request Body:**

`{  "language":  "hausa"  }` 

**Response (200 OK):**

`{  "message":  "successfully selected hausa"  }` 

> ⚠️ Must be called **before** starting the Google OAuth flow.

----------

### 2. **Start Google OAuth Login**

Redirect the user to this endpoint to initiate Google login.

**Endpoint:**

`GET /google-auth/login` 

**How to Use:**

Use a browser redirect 

**Example:**

`<a  href="http://localhost:PORT/google-auth/login"> <button>Continue with Google</button> </a>` 


----------

### 3. **Callback After Google Auth**

Google redirects back to:

`GET /google-auth/callback` 

Handled internally by the server using Passport — no frontend action required here.

-   On success → Redirects to `/success`
    
-   On failure → Redirects to `/failed`
    

----------

### 4. **Success Response**

**Endpoint:**

`GET /success` 

**Response:**

```
{  
	"success":  true,  
	"data":  {  
		"user":  {  
			"_id":  "userId",  
			"email":  "johndoe@example.com",  
			"username":  "john doe",  
			"language":  "hausa", ... 
		}, 
		"token":  "jwt.token.here"  
	},  
	"message":  "login with google successfully"  
	}
``` 

-   A JWT token is set in a `httpOnly` cookie automatically.
    
-   No need to store the token manually on the frontend.
    

----------

### 5. **Failure Response**

**Endpoint:**

`GET /failed` 

**Response:**

```
{
  "success": false,
  "data": null,
  "message": "Failed to login with Google"
}
```

----------

### ✅ Notes

-   JWT is set as a cookie (`token`), valid for 1 day.
    
-   To make authenticated API requests, include `credentials: 'include'` in `fetch` or `axios` requests.
    
-   Language is stored in the user's profile on signup.
-   OTP is valid for 5 minutes.
    
-   After OTP verification, session is used to track the user's email securely.
    
-   Session expires in 6 minutes or after password reset is complete.
    
-   All responses follow the ```{ code, success, message, data }``` format.


## ** 📚Lesson Management *

### **Overview**

This API allows you to manage and retrieve lessons for different languages. The backend uses **JWT token** authentication, stored in **cookies**. The following API endpoints are available:

----------

### **1. GET /lessons**

#### **Description**

Retrieve a specific lesson based on the language preference and pagination.

#### **Request Parameters**

-   **`skip`** (Optional, Default: 0): The number of lessons to skip. If `skip=1`, the second lesson will be returned, `skip=2` for the third lesson, etc.
    
-   **`language`** (Required): The language for the lesson translation. This will be used to filter lessons based on the language set in the cookie.
    

#### **Authentication**

The JWT token must be sent via **cookies** (not the Authorization header).

-   The token is expected to be stored in a cookie called **`token`**.
    

#### **Example Request**

`GET /lessons?skip=1` 

#### **Example Response**


```
{  
	"code":  200,  
	"success":  true,  
	"data":  [  
		{  
			"topic":  "Family",  
			"lessonNumber":  2,  
			"englishTranslation":  "brother",  
			"translation":  {  
				"language":  "yoruba",  
				"text":  "ìyá",  
				"pronunciation":  "yoruba_iya.mp3" 
			 }  
		 } 
	 ],  
	"message":  "lessons retrieved successfully"  
}
``` 

#### **Error Responses**

-   **401 Unauthorized**: Token is missing, invalid, or expired.
    

----------

### **2. POST /lessons/add-lesson**

#### **Description**

Add a new lesson or update an existing lesson. Only **admin** users can access this endpoint.

#### **Request Body**


```
{
  "lessonNumber": 1,
  "topic": "Family",
  "level": "beginner",
  "englishTranslation": "brother",
  "translations": [
    {
      "language": "yoruba",
      "text": "ìyá",
      "pronunciation": "yoruba_iya.mp3"
    },
    {
      "language": "igbo",
      "text": "nne",
      "pronunciation": "igbo_nne.mp3"
    },
    {
      "language": "hausa",
      "text": "uwa",
      "pronunciation": "hausa_uwa.mp3"
    }
  ]
}

``` 

#### **Authentication**

-   Only authenticated **admin** users can add or edit lessons.
    
-   JWT token must be included in cookies (stored as `token`).
    

#### **Example Request**



```
POST /lessons/add-lesson
Content-Type: application/json
Cookie: token=<your-jwt-token>

{
  "lessonNumber": 1,
  "topic": "Family",
  "level": "beginner",
  "englishTranslation": "brother",
  "translations": [
    {
      "language": "yoruba",
      "text": "ìyá",
      "pronunciation": "yoruba_iya.mp3"
    }
  ]
}
``` 

#### **Response**


```
{
  "code": 201,
  "success": true,
  "message": "lesson added successfully",
  "data": {
    "_id": "60c72b9f8d3c3b12c1f2f4bb",
    "lessonNumber": 1,
    "topic": "Family",
    "level": "beginner",
    "englishTranslation": "brother",
    "translations": [
      {
        "language": "yoruba",
        "text": "ìyá",
        "pronunciation": "yoruba_iya.mp3"
      }
    ]
  }
}

``` 

----------

### **3. PUT /lessons/edit-lesson/:id**

#### **Description**

Edit an existing lesson by providing its `id` and updated information. Only **admin** users can edit lessons.

#### **Request Parameters**

-   **`id`** (Required): The unique identifier of the lesson to be edited.
    

#### **Request Body**


```
{
  "lessonNumber": 1,
  "topic": "Family",
  "level": "beginner",
  "englishTranslation": "sister",
  "translations": [
    {
      "language": "yoruba",
      "text": "àbúrò obìnrin",
      "pronunciation": "yoruba_aburo_obinrin.mp3"
    }
  ]
}

``` 

#### **Authentication**

-   Only authenticated **admin** users can edit lessons.
    
-   JWT token must be included in cookies.
    

#### **Example Request**


```
PUT /lessons/edit-lesson/60c72b9f8d3c3b12c1f2f4bb
Content-Type: application/json
Cookie: token=<your-jwt-token>

{
  "lessonNumber": 1,
  "topic": "Family",
  "level": "beginner",
  "englishTranslation": "sister",
  "translations": [
    {
      "language": "yoruba",
      "text": "àbúrò obìnrin",
      "pronunciation": "yoruba_aburo_obinrin.mp3"
    }
  ]
}
``` 

#### **Response**


```
{
  "code": 200,
  "success": true,
  "message": "lesson successfully updated",
  "data": {
    "_id": "60c72b9f8d3c3b12c1f2f4bb",
    "lessonNumber": 1,
    "topic": "Family",
    "level": "beginner",
    "englishTranslation": "sister",
    "translations": [
      {
        "language": "yoruba",
        "text": "àbúrò obìnrin",
        "pronunciation": "yoruba_aburo_obinrin.mp3"
      }
    ]
  }
}
``` 

----------

### **4. DELETE /lessons/delete-lesson/:id**

#### **Description**

Delete an existing lesson. Only **admin** users can delete lessons.

#### **Request Parameters**

-   **`id`** (Required): The unique identifier of the lesson to be deleted.
    

#### **Authentication**

-   Only authenticated **admin** users can delete lessons.
    
-   JWT token must be included in cookies.
    

#### **Example Request**

```
DELETE /lessons/delete-lesson/60c72b9f8d3c3b12c1f2f4bb
Cookie: token=<your-jwt-token>
``` 

#### **Response**

```
{
  "code": 200,
  "success": true,
  "message": "lesson successfully deleted",
  "data": null
}
``` 

----------

### **Authentication Details**

#### **JWT Token**

-   The JWT token is stored in the **cookie** named `token`.
    
-   The token is used to authenticate the user and determine their access level.
    
-   If no token is found or the token is invalid, the user will receive a `401 Unauthorized` response.
    

#### **Cookie Configuration**

-   **`token`**: The cookie that holds the JWT token.
    
-   **`HttpOnly`**: Ensures the cookie cannot be accessed via JavaScript.
    
-   **`Secure`**: Ensure cookies are only sent over HTTPS connections in production.
    

----------

### **Common Error Responses**

-   **401 Unauthorized**: Missing or invalid JWT token.
    
-   **400 Bad Request**: Missing required parameters or invalid input.
    
-   **404 Not Found**: Resource (lesson) not found.
    
-   **500 Internal Server Error**: Server error.
    