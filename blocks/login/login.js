const LOGIN_ERROR = 'There was a problem processing your request.';

export function reset() {
  const block = document.body.querySelector('main .login.block');
  block.querySelector('.message ').classList.remove('error');
  block.querySelector('input[name="username"]').classList.remove('error');
  block.querySelector('input[name="password"]').classList.remove('error');
}

/**
 * Open/Show the login form.
 */
export function open() {
  document.body.querySelector('main .login.block').classList.add('open');
  document.body.classList.add('no-scroll');
}

/**
 * Close the Login form.
 */
export function close() {
  document.body.querySelector('main .login.block').classList.remove('open');
  document.body.classList.remove('no-scroll');
  reset();
}

/**
 * Displays errors for logging in.
 *
 * @param {string[]} errors
 */
export function displayError(errors) {
  const message = document.body.querySelector('main .login.block').querySelector('.message ');
  const details = message.querySelector('.details');
  const spans = [];
  [LOGIN_ERROR, ...errors].forEach((m) => {
    const span = document.createElement('span');
    span.textContent = m;
    spans.push(span);
  });
  details.replaceChildren(...spans);
  message.classList.add('error');
}

function observeForm() {
  const script = document.createElement('script');
  script.type = 'text/partytown';
  script.innerHTML = `
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '${window.hlx.codeBasePath}/blocks/login/login-delayed.js';
    document.head.append(script);
  `;
  document.head.append(script);
}

let alreadyDeferred = false;
function initLogin() {
  if (alreadyDeferred) {
    return;
  }
  alreadyDeferred = true;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = `${window.hlx.codeBasePath}/blocks/login/login-delayed.js`;
  document.head.append(script);
}

export default function decorate(block) {
  block.innerHTML = `
    <div class="login-overlay"></div>
    <div class="login-form">
      <form>
        <h2 class="title">Sign In</h2>
        <div class="message">
          <svg class="icon error" role="presentation"><use xlink:href="/icons/icons.svg#error"></use></svg>
          <svg class="icon success" role="presentation"><use xlink:href="/icons/icons.svg#success"></use></svg>
          <div class="details">
            <span></span>
          </div>
        </div>
        <div class="inputs">
          <input name="username" aria-label="email address" aria-required="true"
              type="text" placeholder="Email Address*" autocomplete="email" >
          <input name="password" aria-label="password" aria-required="true" 
              type="password" placeholder="Password*" autocomplete="current-password">
        </div>
        <div class="help">
          <div class="remember">
            <input type="checkbox" name="rememberMe" aria-label="remember me" id="rememberMe">
            <div class="checkbox"></div>
            <label for="rememberMe">Remember me</label>
          </div>
          <a href="#" class="forgot-password" role="button">I forgot my password</a>
          <div class="warning" role="alert">
            Don’t check this box if you are using a public computer or shared device.
          </div>
        </div>
        <div class="cta">
          <div class="button-container">
            <a href="" class="button primary submit" role="button">Sign In</a>
          </div>
          <div class="button-container">
            <a href="" class="button secondary cancel" role="button">Cancel</a>
          </div>
        </div>
        <div class="divider">OR</div>
        <div class="social-sign-in">
          <a class="fb button" role="button">
            <img src="https://facebookbrand.com/wp-content/uploads/2019/10/Copy-of-facebook-app.svg" alt="facebook icon #1" class="facebook">
            <span>Continue with Facebook</span>
          </a>
          <a class="google button" role="button">
            <img src="data:image/png;base64,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" alt="Google icon #1" loading="lazy" class="google_logo">
            <span>Continue with Google</span>
          </a>
          <a class="apple button" role="button">
            <span>Continue with Apple</span>
          </a>
        </div>
        <div class="terms">
          By clicking 'SIGN IN' or registering using any of the above third-party logins, I agree to the 
          <a href="/terms-of-use">Terms of Use</a> and <a href="/privacy-policy">Privacy Policy </a> for this website.
        </div>
        <button type="submit" aria-label="Submit" title="Submit" class="sr-only"></button>
      </form>
      <div class="create-account">
        <div class="container">
          Not a member yet?
          <br>
          <div class="create-button" role="button" tabindex="0">Create an account</div>
        </div>
      </div>
    </div>
  `;
  observeForm();
  initLogin();
}
