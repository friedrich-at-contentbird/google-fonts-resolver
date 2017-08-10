# Introduction

This is a solution for web fonts self-hosted CDN. It reduces time latency to Google web fonts server. In our context, it reduced ~7x times (from `200ms` to `30ms`).

After deploying, you just replace `fonts.googleapis.com` to your `[proxy_fonts_hostname]` in stylesheet source.

Example :

```html
<link href="https://fonts.googleapis.com/css?family=Noto+Sans:400,400i,700,700i&amp;subset=vietnamese" rel="stylesheet">

to

<link href="https://fonts.example.com/css?family=Noto+Sans:400,400i,700,700i&amp;subset=vietnamese" rel="stylesheet">
```

# Installation

```bash
$ npm install
$ node main.js [proxy_fonts_hostname] [port=3000]
```

# Usage

NGINX configuration file

```nginx
proxy_cache_path /var/nginx/cdn_cache levels=1:2 use_temp_path=off keys_zone=cdn_cache:1024m max_size=1G inactive=14d;


server {
	listen 443 http2;
	listen [::]:443 http2;

	server_name [proxy_fonts_hostname];
	
	ssl_certificate	 /etc/nginx/key/[proxy_fonts_hostname].crt;
	ssl_certificate_key /etc/nginx/key/[proxy_fonts_hostname].key;

    location /css {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header User-Agent $http_user_agent;
        proxy_redirect off;

        proxy_cache cdn_cache;
        proxy_cache_key "$request_uri";
        proxy_cache_lock on;
        proxy_cache_lock_age 5s;
        proxy_cache_lock_timeout 5s;
        proxy_cache_methods GET;
        proxy_cache_valid 200 1d;
        proxy_cache_valid any 60s;

        add_header X-Cache-Status $upstream_cache_status;

        expires 7d;
    }

    location / {
        proxy_pass https://fonts.gstatic.com/;
        proxy_http_version 1.1;
        proxy_set_header User-Agent $http_user_agent;
        proxy_set_header Host fonts.gstatic.com;
        proxy_redirect off;

        proxy_cache cdn_cache;
        proxy_cache_key "$request_uri";
        proxy_cache_lock on;
        proxy_cache_lock_age 5s;
        proxy_cache_lock_timeout 5s;
        proxy_cache_methods GET;
        proxy_cache_valid 200 7d;
        proxy_cache_valid any 60s;

        add_header X-Cache-Status $upstream_cache_status;

        expires 7d;
    }
}
``` 