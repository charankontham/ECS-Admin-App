# EcsAdminApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

bugs:

Dates format fix and storing and retrieving the dates should match the time zone.
Add enableImageIdButton attributes to the child image-uploader component in view product, view brand, view sub category components
Headings of the sections need to be changed like sub categories details sections, categories details section, brand details section headings.
Add sort direction and asc or desc filters to pagination in base service class.
Update snackbars position and message contents, panel classes.
When a page is refreshed, component is always showing the login form and automatically displaying the component which is refreshed, but I don't want to blink the login form and then load the component. instead it should simply check the whether user is logged in or not that's it

improvements:

Add text formating/styling options in product description
Multi select/delete for Images and products
Add images dropdown to choose the existing image in product creation form
Sync mysql and mongodb analytics data in admin dashboards (Create a sync data button in dashboard for relatime data syncing)
Store "Out of stock" items in mongodb
Add retry mechanism if any failures
