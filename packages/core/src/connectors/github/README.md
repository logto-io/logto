# GitHub Connector

The GitHub connector provides the ability to easily integrate GitHub’s OAuth App.

Official guide on OAuth App: [https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app)

## Prerequests

A GitHub account, both personal and organazation are OK.

## Configuration On GitHub

Follow the official guide above to create an OAuth App step by step, notice on those fields:

### 1. Homepage URL

Simply input your website’s url like `www.example.com` 

### 2. Authorization callback URL

also `www.example.com`

## Settings

Name | Type | Description | Required 
------------ | ------------ | ------------- | ---
clientId | string | The client ID you received from GitHub when you created an OAuth App | YES
clientSecret | string | The client secret you received from GitHub when you created an OAuth App | YES
