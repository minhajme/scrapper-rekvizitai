<?php

namespace App\Controller;
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
        return $this->render('home/index.html.twig', []);
    }
/*
    #[Route('/get_rows', name: 'get_rows', methods: ['GET'])]
    public function getRows(Request $request, MessageBusInterface $bus): Response
    {
        return $this->json(['data' => []]);
    }

    #[Route('/crawl', name: 'crawl', methods: ['GET'])]
    public function crawl(Request $request, MessageBusInterface $bus): Response {
        $ids = $request->query->all()['search']['value'];
        return $this->json([]);
    } */
}
