# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--hsf-commonmoves--hlxsites.hlx.page/
- Live: https://main--hsf-commonmoves--hlxsites.hlx.live/

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/aem-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)


### Local Proxy for APIs
There are numerous APIs that this site relies on, including but not limited to:

* Account (login, profile, etc)
* Blog
* Properties (search, listing, etc)
* Agent (details, search)
* Suggestions 

All of these APIs are hosted on an AMS system. To make use of them locally, a proxy is needed.

There are two ways to set up the local proxy:

* [Real Domain Proxy](#real-domain-proxy)
  * Less configuration, but must be aware when proxy is/isn't running.
* [Local Proxy to Remote](#local-proxy-to-remote)
  * More configuration, but explicit domain for proxy - clear delineation of live and proxied traffic.

Either way, you need to download and install a local proxy. These instructions use [Proxyman](https://proxyman.io/download). Once you download and install Proxyman, you will need to also install the Proxyman CA certs. These are needed to be able to route the secure traffic.


#### Real Domain Proxy

In this setup, the proxy is configured to route non-API traffic on the Staging domain to your local computer. So all requests _except_ the APIs will go the local host. The API calls will remain routed to the Stage domain.

1. Create a new Allow List entry:
    * _Tools_ => _Allow List_
    * Name: `BHHS Stage`
    * Rule: `https://stage.commonmoves.com*`
    * Any, Use Wildcard
    * Include all subpaths of this URL: Checked

1. Create a new Map Remote Entry:
   * _Tools_ => _Map Remote_
   * Matching Rule:
     * Name: `BHHS API`
     * Rule: `https://stage.commonmoves.com(?!(/bin|/content)).*`
     * Any, Use Regex
     * Include all subpaths of this URL: Checked
   * Map To: 
     * Protocol: `http`
     * Host: localhost
     * Port: 3000



#### Local Proxy to Remote

This setup uses a locally resolved domain, which will Proxyman will use to route the traffic. All non-API traffic will route to localhost, all API traffic will go to the Stage domain.

1. Add an entry to `/etc/hosts`:
   Proxyman won't proxy localhost, so a custom domain is required. Add the following (if you already have a host entry for 127.0.0.1, simply add the new domain)
> 127.0.0.1 proxyman.debug 

2. Create a self-signed cert. This is necessary for the AEM Cli to so that cookies can be persisted. It really doesn't matter what you answer for the questions. Just make sure you do not create the certs in the code repo, or add them to Git.

(`/some/path` is used as a reference here, find an appropriate spot on your local computer)

```
$ cd /some/path
$ openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout localhost.key -out localhost.crt
```

3. Create a new Allow List entry:
   * _Tools_ => _Allow List_
   * Name: *Localhost*
   * Matching Rule `https:\/\/proxyman\.debug:\d+.*`
   * Any, Use Regex
   * Include all subpaths of this URL: checked

4. Create a new Map Remote Entry:
    * _Tools_ => _Map Remote_
   * Matching Rule
     * Name: *BHHS API*
     * Rule: `https://proxyman.debug:\d+(/bin|/content).*`
     * Any, Use Regex
     * Include all subpaths of this URL: checked
   * Map To
     * Protocol: `https`
     * Host: `stage.commonmoves.com`
     * Port: `443`

5. Staring the AEM local proxy requires also passing in the Cert info, to run using https:

(`/some/path` is the same place you previously created the cert)

```
% aem up --tls-cert /some/path/localhost.crt --tls-key /some/path/localhost.key
```

To view Proxied site use: https://proxyman.debug:3000/
