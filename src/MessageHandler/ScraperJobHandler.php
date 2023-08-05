<?php

namespace App\MessageHandler;

use App\Message\ScraperJob;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class ScraperJobHandler
{
    public function __invoke(ScraperJob $message)
    {
        // query the handler 
    }
}