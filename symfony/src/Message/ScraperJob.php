<?php

namespace App\Message;

class ScraperJob
{
    public function __construct(private readonly string $needle) {}
    public function getNeedle(): string
    {
        return $this->needle;
    }
}