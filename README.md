Google-extension `last-seen-approx` `v. 0.0`

An app which allow to know about when yt user was last seen. Based on Youtube open data.
Current project includes both backend and frontend part of this app.



**MANUAL**

**How to use after activation and authorization via Google account:**

1. Got to main profile page, for example let it be follow page:

![alt text](https://github.com/skyshy0707/last-seen-approx/blob/master/about_app/1.JPG?raw=true)

2. You can seen circle button with extension label:

![alt text](https://github.com/skyshy0707/last-seen-approx/blob/master/src/frontend/assets/images/logo-round.png?raw=true)

3. Click at the button and wait until data will be shown near to subscribe button

![alt text](https://github.com/skyshy0707/last-seen-approx/blob/master/about_app/3.JPG?raw=true)

4. You can see results with type of activity with the link of related resourse:

![alt text](https://github.com/skyshy0707/last-seen-approx/blob/master/about_app/4.JPG?raw=true)

!NB If the resource is a playlist then you'll see the link of 404 page that resource isn't exist, because Youtube 
don't have separate page for playlists.

5. Next, If you wanna get `last seen` timestamp just another time, wait 24 hours.

![alt text](https://github.com/skyshy0707/last-seen-approx/blob/master/about_app/5.JPG?raw=true)



**TO DO:**

1. CRITICAL - Backend: Realize requests getting videos with related yt user comments asynchronically
2. CRITICAL - Frontend: Fix `not attaching content scripts` by realizing adding `stop point` 
in the body of mutation cycle that checks when actual url is not related to `valid pattern` (when 
content script should not be added to the tab)
3. INCONSIDERABLE: Realize checking `last_use` timestamp throungh getting response from server endpoint.