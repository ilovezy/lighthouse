# How to become a contributor and submit your own code

## Contributor License Agreements

We'd love to accept your sample apps and patches! Before we can take them, we have to jump a couple of legal hurdles.

Please fill out either the individual or corporate Contributor License Agreement (CLA).
  * If you are an individual writing original source code and you're sure you own the intellectual property, then you'll need to sign an [individual CLA](https://developers.google.com/open-source/cla/individual).
  * If you work for a company that wants to allow you to contribute your work, then you'll need to sign a [corporate CLA](https://developers.google.com/open-source/cla/corporate).

Follow either of the two links above to access the appropriate CLA and instructions for how to sign and return it. Once we receive it, we'll be able to
accept your pull requests.

## Contributing A Patch

1. Submit an issue describing your proposed change to the repo in question.
1. The repo owner will respond to your issue promptly.
1. If your proposed change is accepted, and you haven't already done so, sign a Contributor License Agreement (see details above).
1. Fork the repo, develop and test your code changes.
1. Ensure that your code adheres to the existing style in the sample to which you are contributing.
1. Submit a pull request.


## Release guide

```sh
# * Build the latest *
yarn
cd lighthouse-cli; yarn; yarn run build; cd ..
cd lighthouse-viewer; yarn; gulp; cd ..
cd lighthouse-extension; yarn; gulp build; cd ..

# * Bump it *
echo "Bump the versions in extension/app/manifest.json and package.json"

# * Test err'thing * 
echo "Test the CLI."
yarn run smoke
echo "Test a fresh local install (see below)"
echo "Test the extension"
echo "Test the lighthouse-viewer build"

# * Put up the PR *
echo "Branch and commit the version bump."
echo "Generate a PR and get it merged."

# * Deploy-time *
cd lighthouse-extension; gulp build; gulp package; cd ..
echo "Upload the package zip to CWS dev dashboard"

npm publish
yarn run deploy-viewer

echo "Use the GH web interface to tag the release"
echo "Generate the release notes, and update the release page"

# * Tell the world!!! *
echo "Inform various peoples"


# * Testing a fresh local install *
# (start from lighthouse root)
cd ..; mkdir tmp; cd tmp
npm install ../lighthouse
npm explore lighthouse -- npm run smoke
npm explore lighthouse -- npm run smokehouse
npm explore lighthouse -- npm run chrome # try the manual launcher
cd ..; rm -rf ./tmp;
```
