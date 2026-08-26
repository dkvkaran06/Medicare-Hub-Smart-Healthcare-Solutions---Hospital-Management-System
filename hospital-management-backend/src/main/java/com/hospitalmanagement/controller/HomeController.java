package com.hospitalmanagement.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public landing page for the backend root ("/"). Without this, opening the
 * Render URL in a browser hit Spring Security first and rendered the Whitelabel
 * "Unauthorized 401" error page (every non-public path requires a token). The
 * root is now permitted in SecurityConfig and serves this small status page so
 * the backend link is presentable. It exposes no data; the /api/** endpoints
 * still require a valid JWT.
 */
@RestController
public class HomeController {

    private static final String PAGE = ""
        + "<!doctype html>\n"
        + "<html lang='en'>\n"
        + "<head>\n"
        + "<meta charset='utf-8'>\n"
        + "<meta name='viewport' content='width=device-width, initial-scale=1'>\n"
        + "<title>Medicare Hub API</title>\n"
        + "<style>\n"
        + "  :root { color-scheme: dark; }\n"
        + "  * { box-sizing: border-box; }\n"
        + "  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;\n"
        + "    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\n"
        + "    background:radial-gradient(1200px 600px at 50% -10%, #12303a, #0b1116 60%); color:#e6edf3; padding:24px; }\n"
        + "  .card { width:100%; max-width:560px; background:rgba(255,255,255,0.03);\n"
        + "    border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:40px;\n"
        + "    box-shadow:0 20px 60px rgba(0,0,0,0.35); }\n"
        + "  .badge { display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:600;\n"
        + "    letter-spacing:.02em; color:#7ee2b8; background:rgba(46,160,110,0.12);\n"
        + "    border:1px solid rgba(46,160,110,0.3); padding:6px 12px; border-radius:999px; }\n"
        + "  .dot { width:8px; height:8px; border-radius:50%; background:#37d99e; animation:pulse 2s infinite; }\n"
        + "  @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(55,217,158,.5)} 70%{box-shadow:0 0 0 10px rgba(55,217,158,0)}\n"
        + "    100%{box-shadow:0 0 0 0 rgba(55,217,158,0)} }\n"
        + "  h1 { margin:20px 0 6px; font-size:26px; }\n"
        + "  p.sub { margin:0 0 24px; color:#9aa7b2; line-height:1.5; }\n"
        + "  .row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px; }\n"
        + "  a.btn { text-decoration:none; font-weight:600; font-size:14px; padding:11px 16px; border-radius:10px;\n"
        + "    border:1px solid rgba(255,255,255,0.12); color:#e6edf3; }\n"
        + "  a.btn.primary { background:#2ea36e; border-color:#2ea36e; color:#04120b; }\n"
        + "  .note { font-size:13px; color:#8b98a4; line-height:1.55; border-top:1px solid rgba(255,255,255,0.07);\n"
        + "    padding-top:16px; }\n"
        + "  code { background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:6px; font-size:12px; }\n"
        + "</style>\n"
        + "</head>\n"
        + "<body>\n"
        + "  <div class='card'>\n"
        + "    <span class='badge'><span class='dot'></span> API ONLINE</span>\n"
        + "    <h1>Medicare Hub API</h1>\n"
        + "    <p class='sub'>Backend service for the Medicare Hub Hospital Management System. It is running and healthy.</p>\n"
        + "    <div class='row'>\n"
        + "      <a class='btn primary' href='https://medicare-hub-smart-healthcare-solut.vercel.app'>Open the app</a>\n"
        + "      <a class='btn' href='/healthz'>Health check</a>\n"
        + "    </div>\n"
        + "    <p class='note'>This is an API server, not a website. Endpoints under <code>/api</code> require a valid\n"
        + "    login token (JWT); opening them directly returns <code>401 Unauthorized</code> by design. Sign in\n"
        + "    through the app above to use it.</p>\n"
        + "  </div>\n"
        + "</body>\n"
        + "</html>\n";

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return PAGE;
    }
}
