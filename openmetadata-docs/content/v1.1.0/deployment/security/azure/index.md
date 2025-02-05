---
title: Azure SSO
slug: /deployment/security/azure
---

# Azure SSO

Follow the sections in this guide to set up Azure SSO.

{% note %}

Security requirements for your **production** environment:
- **DELETE** the admin default account shipped by OM in case you had [Basic Authentication](/deployment/security/basic-auth)
  enabled before configuring the authentication with Azure SSO.
- **UPDATE** the Private / Public keys used for the [JWT Tokens](/deployment/security/enable-jwt-tokens). The keys we provide
  by default are aimed only for quickstart and testing purposes. They should NEVER be used in a production installation.

{% /note %}

## Create Server Credentials

### Step 1: Login to Azure Active Directory

- Login to [Microsoft Azure Portal](https://azure.microsoft.com/en-in/services/active-directory/external-identities/)
- Navigate to the Azure Active Directory.

{% note %}

Admin permissions are required to register the application on the Azure portal.

{% /note %}

### Step 2: Create a New Application

- From the Azure Active Directory, navigate to the `App Registrations` section from the left nav bar.

{% image src="/images/v1.1.0/deployment/security/azure/create-app-1.png" alt="create-app" /%} 

- Click on `New Registration`. This step is for registering the OpenMetadata UI.

{% image src="/images/v1.1.0/deployment/security/azure/create-app-2.png" alt="create-app" /%}

- Provide an Application Name for registration.
- Provide a redirect URL as a `Single Page Application`.
- Click on `Register`.

{% image src="/images/v1.1.0/deployment/security/azure/create-app-3.png" alt="create-app" /%}

### Step 3: Where to Find the Credentials

- The `Client ID` and the `Tenant ID` are displayed in the Overview section of the registered application.

{% image src="/images/v1.1.0/deployment/security/azure/where-to-find-credentials.png" alt="create-app" /%}

- When passing the details for `authority`, the `Tenant ID` is added to the URL as shown in the example
  below. `https://login.microsoftonline.com/TenantID`

```commandline
"authority": "https://login.microsoftonline.com/c11234b7c-b1b2-9854-0mn1-56abh3dea295"
```

{% partial file="configure-ingestion.md" /%}
