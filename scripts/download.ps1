param(
    [string]$OutputPath = "C:\Users\viren\Downloads\ai-website-cloner-template-master\ai-website-cloner-template-master\public\images\downloaded"
)

$images = @(
    @{url="https://hdmuscle.com/cdn/shop/files/DSC06090_copy.jpg?v=1763690188&width=2750"; name="hero.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/HeavyMetals.jpg?v=1685721934&width=500"; name="badge-heavy-metals.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/formulas_95b0297a-d75a-411b-aa37-3f79d3f7c711.jpg?v=1683863231&width=500"; name="badge-formulas.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/NoDyes.jpg?v=1683863250&width=500"; name="badge-no-dyes.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/3rdParty.jpg?v=1683863268&width=500"; name="badge-3rdparty.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/Properlydosed.jpg?v=1683863217&width=500"; name="badge-dosed.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/Registered.jpg?v=1684256512&width=500"; name="badge-registered.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/collections/IMG_4801.jpg?v=1763695297&width=1280"; name="category-health.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/collections/Untitled_design_32.png?v=1763695066&width=1280"; name="category-preworkout.png"},
    @{url="https://hdmuscle.com/cdn/shop/collections/MAX09367.jpg?v=1763695274&width=1280"; name="category-intraworkout.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/collections/Untitled_design_28.png?v=1763694249&width=1280"; name="category-postworkout.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/PreHD-Essential-Blue-Rasberry.png?v=1761919637&width=1280"; name="product-prehd-essential.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/PreHD-Essential-SuppFacts-BLUE-RASPBERRY_US.png?v=1761919644&width=1280"; name="product-prehd-essential-facts.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/Ultra_PeachRings_WhiteLid_1.png?v=1758833383&width=1280"; name="product-prehd-ultra.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/Non-Stim-ELITE-PL.png?v=1755483444&width=1280"; name="product-prehd-elite.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/PumpHD-Rainbow-Strips.png?v=1757610060&width=1280"; name="product-pumphd.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/HydraHD-Tangerine-US.png?v=1771000697&width=1280"; name="product-hydrahd.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/000031460020.jpg?v=1764729480&width=2750"; name="about-hero.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/SleepHD_Web1.png?v=1695445093&width=400"; name="testimonial-whitney.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/Screen_Shot_2023-09-12_at_11.28.44_PM.jpg?v=1695445115&width=400"; name="testimonial-greg.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/Elite_Web2.png?v=1695445141&width=400"; name="testimonial-christina.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/HD-Jersey-Navy-Front.jpg?v=1771017480&width=1280"; name="apparel-jersey-navy.jpg"},
    @{url="https://hdmuscle.com/cdn/shop/files/HD-Tribal-Chrome-Black-FRONT.png?v=1769128936&width=1280"; name="apparel-tshirt-black.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/HD-WeightPlateMan-White-BACK.png?v=1769128869&width=1280"; name="apparel-tshirt-white.png"},
    @{url="https://hdmuscle.com/cdn/shop/files/download_1.svg?v=1763705645&width=400"; name="feature-returns.svg"},
    @{url="https://hdmuscle.com/cdn/shop/files/download.svg?v=1763705725&width=400"; name="feature-shipping.svg"},
    @{url="https://hdmuscle.com/cdn/shop/files/download_2.svg?v=1763705717&width=400"; name="feature-guarantee.svg"},
    @{url="https://hdmuscle.com/cdn/shop/files/download_4.svg?v=1763705723&width=400"; name="feature-checkout.svg"}
)

$images | ForEach-Object {
    $img = $_
    $outFile = Join-Path $OutputPath $img.name
    Write-Host "Downloading $($img.name)..."
    try {
        Invoke-WebRequest -Uri $img.url -OutFile $outFile -TimeoutSec 30 -ErrorAction Stop
        Write-Host "  Done: $($img.name)"
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)"
    }
}

Write-Host "All downloads complete!"