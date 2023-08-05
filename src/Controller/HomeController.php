<?php

namespace App\Controller;

use App\Form\SearchNeedleType;
use App\Message\ScraperJob;
use Predis\Client;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home', methods: ['GET', 'HEAD', 'POST'])]
    public function index(Request $request, MessageBusInterface $bus): Response
    {
        $client = new Client([
            'scheme' => 'tcp',
            'host' => $_ENV['REDIS_HOST'],
            'port' => $_ENV['REDIS_PORT'],
        ]);

        $form = $this->createForm(SearchNeedleType::class);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $needle = $form->getData()['needle'];
            $row = $client->get('scraped-' . $needle);
            print_r($row);
            if (!$row) {
                $bus->dispatch(new ScraperJob($needle));
            } else {
                $redis_rows = [$row];
            }
        } else {
            $redis_rows = $client->get('scraped-*');
        }
        return $this->render('home/index.html.twig', [
            'form' => $form,
        ]);
    }

    #[Route('/get_rows', name: 'get_rows', methods: ['GET'])]
    public function getRows(): Response
    {
        return $this->json(['data' => []]);
    }
}
