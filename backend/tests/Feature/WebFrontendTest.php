<?php

namespace Tests\Feature;

use Tests\TestCase;

class WebFrontendTest extends TestCase
{
    public function test_frontend_index_html_is_served_at_root(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $this->assertStringContainsString('SakuPas', $response->getContent());
        $this->assertStringContainsString('js/app.js', $response->getContent());
    }

    public function test_frontend_css_is_served_with_correct_content_type(): void
    {
        $response = $this->get('/css/style.css');
        $response->assertStatus(200);
        $this->assertStringStartsWith('text/css', (string) $response->headers->get('Content-Type'));
        $this->assertStringContainsString('--terracotta: #E9896A', $response->getContent());
    }

    public function test_frontend_js_is_served_with_correct_content_type(): void
    {
        $response = $this->get('/js/app.js');
        $response->assertStatus(200);
        $this->assertStringStartsWith('application/javascript', (string) $response->headers->get('Content-Type'));
    }
}
