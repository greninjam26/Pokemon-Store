# UploadThing

## Environment Variables

The app uses UploadThing for admin product image uploads:

```env
UPLOADTHING_TOKEN=
UPLOADTHING_SECRET=
UPLOADTHING_APPID=
```

## Flow

1. Admin opens a product create or edit form.
2. The product form uploads images through UploadThing.
3. UploadThing returns hosted image URLs.
4. The product form stores those URLs in the product `images` array.

## Access

Uploads are protected by the UploadThing middleware in:

```txt
app/api/uploadthing/core.ts
```

Only signed-in admin users can upload product images.

## Next Image

UploadThing image hosts must be allowed in:

```txt
next.config.ts
```

If a new UploadThing hostname appears in an image URL, add it to the Next image remote patterns.
