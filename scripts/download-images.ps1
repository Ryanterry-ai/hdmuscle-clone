# Download all images from hdmuscle.com
$images = @(
    # Hero
    "https://hdmuscle.com/cdn/shop/files/DSC06090_copy.jpg?v=1763690188&width=2750",
    
    # Trust Badges
    "https://hdmuscle.com/cdn/shop/files/HeavyMetals.jpg?v=1685721934&width=500",
    "https://hdmuscle.com/cdn/shop/files/formulas_95b0297a-d75a-411b-aa37-3f79d3f7c711.jpg?v=1683863231&width=500",
    "https://hdmuscle.com/cdn/shop/files/NoDyes.jpg?v=1683863250&width=500",
    "https://hdmuscle.com/cdn/shop/files/3rdParty.jpg?v=1683863268&width=500",
    "https://hdmuscle.com/cdn/shop/files/Properlydosed.jpg?v=1683863217&width=500",
    "https://hdmuscle.com/cdn/shop/files/Registered.jpg?v=1684256512&width=500",
    
    # Categories
    "https://hdmuscle.com/cdn/shop/collections/IMG_4801.jpg?v=1763695297&width=1280",
    "https://hdmuscle.com/cdn/shop/collections/Untitled_design_32.png?v=1763695066&width=1280",
    "https://hdmuscle.com/cdn/shop/collections/MAX09367.jpg?v=1763695274&width=1280",
    "https://hdmuscle.com/cdn/shop/collections/Untitled_design_28.png?v=1763694249&width=1280",
    
    # Products
    "https://hdmuscle.com/cdn/shop/files/PreHD-Essential-Blue-Rasberry.png?v=1761919637&width=1280",
    "https://hdmuscle.com/cdn/shop/files/PreHD-Essential-SuppFacts-BLUE-RASPBERRY_US.png?v=1761919644&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Ultra_PeachRings_WhiteLid_1.png?v=1758833383&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Ultra_PeachRings.jpg?v=1758833383&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Non-Stim-ELITE-PL.png?v=1755483444&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Elite_PinkLemon.jpg?v=1762384547&width=1280",
    "https://hdmuscle.com/cdn/shop/files/SourGrape.png?v=1750958309&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Black_SourGrape.jpg?v=1762384476&width=1280",
    "https://hdmuscle.com/cdn/shop/files/PumpHD-Rainbow-Strips.png?v=1757610060&width=1280",
    "https://hdmuscle.com/cdn/shop/files/PumpHD-Supp-Facts-Rainbow-Strips.png?v=1764211420&width=1280",
    "https://hdmuscle.com/cdn/shop/files/StimHD_9d7400de-4473-4af8-bd68-902c6689781d.png?v=1759273225&width=1280",
    "https://hdmuscle.com/cdn/shop/files/StimHD-Supp-Facts.png?v=1759273225&width=1280",
    "https://hdmuscle.com/cdn/shop/files/IntraHD_Watermelon_f38c042d-708c-472a-a828-b329ac7baf6b.png?v=1742929990&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Intra_Watermelon.jpg?v=1758833409&width=1280",
    "https://hdmuscle.com/cdn/shop/files/EaaHD_FRONT_Peach-Black-Lid.png?v=1751895371&width=1280",
    "https://hdmuscle.com/cdn/shop/files/EAA_Peach.jpg?v=1764211420&width=1280",
    "https://hdmuscle.com/cdn/shop/files/CreaHD_Transparent.png?v=1772313991&width=1280",
    "https://hdmuscle.com/cdn/shop/files/CreaHD.jpg?v=1772313991&width=1280",
    "https://hdmuscle.com/cdn/shop/files/CarbHD_StrawKiwi-2024.png?v=1744342576&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Carb_StrawKiwi.jpg?v=1762382894&width=1280",
    "https://hdmuscle.com/cdn/shop/files/HydraHD-Tangerine-US.png?v=1771000697&width=1280",
    "https://hdmuscle.com/cdn/shop/files/HydraHD-Supp-Facts-Tangerine.png?v=1771000697&width=1280",
    "https://hdmuscle.com/cdn/shop/files/GlutaHD-FRONT-Black-Lid.jpg?v=1755223771&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Gluta_HD.jpg?v=1758833426&width=1280",
    "https://hdmuscle.com/cdn/shop/files/ProHD_Front_Transparent.png?v=1761919615&width=1280",
    "https://hdmuscle.com/cdn/shop/files/SleepHD_Web1.png?v=1695445093&width=1280",
    "https://hdmuscle.com/cdn/shop/files/Omega3_Front.png?v=1714392098&width=1280",
    "https://hdmuscle.com/cdn/shop/files/D3_Front.png?v=1714392098&width=1280",
    
    # About
    "https://hdmuscle.com/cdn/shop/files/000031460020.jpg?v=1764729480&width=2750",
    
    # Testimonials
    "https://hdmuscle.com/cdn/shop/files/SleepHD_Web1.png?v=1695445093&width=400",
    "https://hdmuscle.com/cdn/shop/files/Screen_Shot_2023-09-12_at_11.28.44_PM.jpg?v=1695445115&width=400",
    "https://hdmuscle.com/cdn/shop/files/Elite_Web2.png?v=1695445141&width=400",
    
    # New Arrivals
    "https://hdmuscle.com/cdn/shop/files/HD-Jersey-Navy-Front.jpg?v=1771017480&width=1280",
    "https://hdmuscle.com/cdn/shop/files/HD-Tribal-Chrome-Black-FRONT.png?v=1769128936&width=1280",
    "https://hdmuscle.com/cdn/shop/files/HD-WeightPlateMan-White-BACK.png?v=1769128869&width=1280",
    "https://hdmuscle.com/cdn/shop/files/HD-Bodybuilding-Club-hat-BLACK.png?v=1769108099&width=1280",
    
    # Trust Features
    "https://hdmuscle.com/cdn/shop/files/download_1.svg?v=1763705645&width=400",
    "https://hdmuscle.com/cdn/shop/files/download.svg?v=1763705725&width=400",
    "https://hdmuscle.com/cdn/shop/files/download_2.svg?v=1763705717&width=400",
    "https://hdmuscle.com/cdn/shop/files/download_4.svg?v=1763705723&width=400",
    
    # Collection images
    "https://hdmuscle.com/cdn/shop/collections/Preworkout_Collection.jpg",
    "https://hdmuscle.com/cdn/shop/collections/Intra_Collection.jpg",
    "https://hdmuscle.com/cdn/shop/collections/Recovery_Collection.jpg",
    "https://hdmuscle.com/cdn/shop/collections/Health_Collection.jpg",
    "https://hdmuscle.com/cdn/shop/collections/Protein_Collection.jpg",
    "https://hdmuscle.com/cdn/shop/collections/Bundles_Collection.jpg"
)

$outputDir = "..\public\images\downloaded"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$images | ForEach-Object {
    $url = $_
    $filename = $url -replace '.*/([^?]+).*', '$1'
    $filename = $filename -replace '\?', '_'
    $filename = $filename -replace '&', '_'
    $filepath = Join-Path $outputDir $filename
    
    Write-Host "Downloading: $filename"
    try {
        Invoke-WebRequest -Uri $url -OutFile $filepath -TimeoutSec 30
    } catch {
        Write-Host "Failed: $filename - $_"
    }
}

Write-Host "Done! Images saved to $outputDir"