export interface NavigationLink {
  href: string;
  label: string;
}

export interface ProductCard {
  href: string;
  badge: string;
  brand: string;
  imageAlt: string;
  imageUrl: string;
  offset?: boolean;
  price: string;
  title: string;
}

export interface CollectionNavigationLink {
  href: string;
  label: string;
}

export interface CollectionProduct {
  href: string;
  badge?: string;
  brand: string;
  imageAlt: string;
  imageUrl: string;
  offset?: boolean;
  price: string;
  title: string;
  year: string;
}

export interface ProductDetailBreadcrumbSegment {
  href: string;
  label: string;
}

export interface ProductDetailGalleryImage {
  alt: string;
  caption: string;
  imageUrl: string;
  size: "wide" | "tall" | "square";
}

export interface ProductDetailRelatedItem {
  brand: string;
  imageAlt: string;
  imageUrl: string;
  price: string;
  title: string;
}

export interface ProductDetailContent {
  breadcrumbs: ProductDetailBreadcrumbSegment[];
  collectionLabel: string;
  condition: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  description: string;
  gallery: ProductDetailGalleryImage[];
  materials: string;
  note: string;
  price: string;
  provenance: string;
  relatedItems: ProductDetailRelatedItem[];
  slug: string;
  title: string;
  authenticationNote: string;
}

export const navigationLinks: NavigationLink[] = [
  { href: "#archive", label: "New Arrivals" },
  { href: "#story", label: "Collections" },
  { href: "#manifest", label: "About" },
];

export const heroContent = {
  eyebrow: "Est. 1992 Preservation",
  title: "ZEITLESS",
  description:
    "A digital sanctuary for rare artifacts and sartorial memories. Discover pieces that feel as permanent as the archive itself.",
  ctaHref: "#archive",
  ctaLabel: "Explore Collection",
  imageAlt: "A dramatic editorial still life of a satin archival garment draped over a chair",
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBa9SpaGIjBA8oCQAX_uD9hnl6XONKTjsu1YSynuv16jWlQt93bP7kukPSWVsL1kkRmXCl2X67_J5s6_8iO1LRygoekmr5Y2AdTQ5hgFgFp3YAjzH8H9VFEwn0PtjR_6ghgUhkIDKBAR5DuaXmXUEeYJ5zF-EtaeHUyUq6PppLlcIPkxAuznKaqlprJd83smHVXJCsHzm7ebkThLuziEFkv0oUqcoq__wF-7EQSTWyDTWH4v8U1jC-F3srcAlqWsy5liGpng5NVpls",
  selectionLabel: "Current Selection: No. 042",
};

export const arrivalsContent = {
  eyebrow: "Seasonal Update",
  title: "New Arrivals",
  viewAllHref: "#story",
};

export const collectionNavigationLinks: CollectionNavigationLink[] = [
  { href: "/#archive", label: "New Arrivals" },
  { href: "/collections", label: "Collections" },
  { href: "/#story", label: "About" },
];

export const collectionHeroContent = {
  eyebrow: "Volume 04 / Curated",
  selectedCount: "12 Selected Items",
  title: "ZEITLESS",
  description:
    "An exploration of enduring silhouettes. This collection captures the intersection of mid-century tailoring and contemporary functionalism.",
};

export const collectionFilters = ["Size", "Brand", "Era"] as const;

export const collectionSortLabel = "Chronological";

export const collectionProducts: CollectionProduct[] = [
  {
    href: "/products/deconstructed-wool-tunic",
    badge: "Rare",
    brand: "Yohji Yamamoto",
    imageAlt:
      "Close up of a structured vintage wool blazer in charcoal grey with sharp lapels against a minimalist beige background.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgKJH_4uYDvSIQTgeTGYmD6CrgLJQAsR05JTDfv4K9K0UJ0f6J5uyWobmshtX-oCMQAV_qj28Hlk2gqv8_ErSOgdvqoAYmheu_iFiVUTXmWRI9yzDcXyCtU8ztcqFiNdE11oqOoz8ARcwVRCZVJ2G6BkhJECGvexgxP8K5Frd31VM-bfHn4abnr2Nu1VpY6gtIa8O2zaZXG-_-4oLTD5wTUBBHkxvDwh5BoNpnTliJ4AKZO9hrE-qITFXJUsPWq06TvgLHkfrAS0Su",
    price: "$1,850",
    title: "Architectural Wool Blazer",
    year: "1994",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    brand: "Issey Miyake",
    imageAlt:
      "Draped raw silk shirt in cream color with oversized cuffs and a high collar hanging in a sun-drenched minimalist studio.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqlZerBOoX7tSbmn3JfOrSWit2LIutEe7RF7AlWGn_5R-EXBqHqAKjHhPgL6_wwSBO3qkhPVwgBV1gZQgwFAuecFU5Ikr0sbp8Zhl0wrOEQr07zC19KIm7Ut-ljEnQxWHng9Ylcd08XECqXW2MUtBIOWtRZsN91Pu1YujvgwZ2-T0oB3Uqu6vKgHWopbwNmaEHVJ8-DpY51hN5GR4tx2q02r7BI6Rkf5nwT3neamThHxOC5q6yMAp8B3lt5WThJ-pEwVEVdAZ_X9_N",
    price: "$920",
    title: "Raw Silk Mantle",
    year: "1988",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    brand: "Jil Sander",
    imageAlt:
      "High-waisted wide-leg trousers in a heavy linen blend with sharp pleats, architectural silhouette, neutral earth tones.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB35bPh3FQZgHqvh26Gw7-hjUdxrZDvpi8wF900NB5geLKwBTcZSJEUosd-Bwydl0sPRJBYkWzo2LVpe5BTyYkB2pDCT05aC2tByHQnnGJTvWcTtHnmbvvzJSB6xScSvw7RKnOmGtpWNt5-LX7JQDvv4DL3Y0ax3yNuq2YY-01QJUOXG5lwpSQ0oqDm3kYMd6B6gLn0ffYxjAuIYewTFuicG2ZjAMn6qEpMQ1AsmdKqEox9AAScDtORKMGhcBxADMeqqqFED2wdQSVs",
    price: "$640",
    title: "Pleated Column Trouser",
    year: "1999",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    brand: "Maison Margiela",
    imageAlt:
      "Full length distressed black leather trench coat with belt detail, high contrast lighting emphasizing texture and patina.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvJmmx9M3eVKKs70St1e9yxMfYGIlKo9gtzSxWEf3Qa-3cWrPcpkcSyCHwo6XRIgvKyXkhUYROaz0Q-KIjO8lmZX-TJOCg4Bl1Tfy-lKY1dMMnZpCLEG67TIEPZ6wXGznKDi4Ft6yjnmakfmsyO3hn7fejwsiOKgD1W-hCXLw-hWGVBwByAOujtYK7FKNCABjpvgPNtkHB6OmbKcxoG1ymp3qgN-JJWGT4DoZiivzB4d88UAKW81aJDg9NSwIX1dedNg0E5syEGI68",
    price: "$3,200",
    title: "Distressed Leather Overcoat",
    year: "2003",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    brand: "Ann Demeulemeester",
    imageAlt:
      "Heavy gauge mohair sweater in deep olive green with sculptural knit patterns, soft fuzzy texture against a clean studio wall.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDBHhh-L2rGb4i69X7P7fMEgoPvptSD1UIaFyr8RORPoGY7_v292q17sStbrLRUaZwbjEQfvyrNV2renWIg1fHMJ2fphTOgr_rGKcgf2wcdbpio_3BiQXFZlpd42tBolrwYRrKQizB50tguCet3lXK8FmEUYzyBdQa-W08M2JhOcSk8KwgfDRXrYXrlSvqIbTIeCl1UGSj0Zj81Jg3dImW-aNGdXOSvoeJmzkTkbg0FHQuJ4uwvpkIFGK7ASbibRnqEW1Trmvr7z1ph",
    price: "$780",
    title: "Textured Mohair Knit",
    year: "2001",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    brand: "Prada",
    imageAlt:
      "Structured geometric leather briefcase in dark tan with minimal metal hardware, architectural lighting casting long shadows.",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvNoBzZ2pds-6PUFGw8jyQ4fW7Vd0E7rAjiQfWlS4OPYtD8uvpWAJhAyaGJXBU1B8ehKQfSjVKiiJumiKtTtf8DQ9ryF9nqiN_Pnm4DBUI5FTuK946dgPL55lCcskDuDfaC1jgQO4PndF4A84woy8n9hNUGpRRo6jKv84DnSwXlZztuRupSt5JME0gwOrbrbKn2TNSBXt3iFUkAqpW-n1EoNMSQInFGOgNsCjpp8GRDKL7lHtLB2umiulYnXD1mSzb7d4PeZoqDqrA",
    price: "$1,100",
    title: "Geometric Attache",
    year: "1996",
  },
];

export const collectionPagination = ["01", "02", "03"] as const;

export const productCards: ProductCard[] = [
  {
    href: "/products/deconstructed-wool-tunic",
    badge: "Rare",
    brand: "Comme des Garçons",
    imageAlt:
      "detail shot of textured linen blazer with hand-stitched lapel on a stone pedestal with soft natural light",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEaHEnJU7iBO7KMPJ1hx2nIQ8y94R3ILJSBmd4H8FRTmMK-iTGXuFWyIyrOLj73q9BAhX2OjyDXeXBWwCoXGHHJgEHh9lRuv0YNnLcdImDtIc2sDDdbps_RlwQdqiIc-a0PtObZQOvUpC35UZwZm_25xz6DDmpYZobjBSViHv26bC7XAKrcinpgHSAqdWI_YMAbOQGadrWyDhh2dP_yEXrvdaK40URzmln4xkabsGUEJ31_qeuC0uRRWcDIkclgANEgqdNJ13L0fbS",
    price: "€1,450",
    title: "Deconstructed Wool Tunic",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    badge: "Archive",
    brand: "Hermès",
    imageAlt:
      "luxury vintage leather handbag with gold hardware detail in a studio setting with sharp shadows",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDYSO3JwCiYn_wHYdjF6Zyr_giDrOoUOWK8jLqy1zSDL9HkagSgJvsQzlHf8gQX55LsEffyXPAx_tUuc0Ciu0iMWuBcKVQLAlJc8pDTN1tutmONVfgH6KAbbwMyljyrEia8wsNqNdP2DiuDJtSafgL9MVLFqWO-BabwXFKeQaLbD2v-4ApHnzClhxQFiFlzSEhOnxbg_QwarIiGsY2KHnzngz9KvfU_y0MvlbJqfK8l5vEgKwId3rvL8g5X7wd1oeaWgx_Ia5mB1JQv",
    offset: true,
    price: "€8,900",
    title: "Vintage Constance 24",
  },
  {
    href: "/products/deconstructed-wool-tunic",
    badge: "Limited",
    brand: "Ann Demeulemeester",
    imageAlt: "high fashion platform boots on a reflective floor with cool atmospheric lighting",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUvrpP7YcFEpsZ7cpwDL42xxgRETlnQOIhCoQrgLWeGGidHoQkJ_qQ4ciyhhqGE_uhb9VYRPTRbHTw-TOoqlgNImTik8_ia7ZC-t4ETKYfgvpXrc_clsC3h7KIWxsPkHsM2anK_uQII-gzbRUrYwONjEd6LxZBQtDYMj2xKm2-BZnR1ieplefbGXIB30p6u4xFj_zd2qCpJ436BU4vcUGH6IL6uCXbfEasbe1MXOu_SfY6_zzDAZVPhinU4_PZH0EEDyKNMl8JMWn7",
    price: "€720",
    title: "Laced Combat Heel",
  },
];

export const productDetailContent: ProductDetailContent = {
  breadcrumbs: [
    { href: "/", label: "Home" },
    { href: "/collections", label: "Collections" },
    {
      href: "/products/deconstructed-wool-tunic",
      label: "Deconstructed Wool Tunic",
    },
  ],
  collectionLabel: "Comme des Garcons / Fall 2004",
  condition: "Excellent vintage condition with light natural wear at the seams.",
  ctaPrimaryLabel: "Reserve Piece",
  ctaSecondaryLabel: "Enquire About Fit",
  description:
    "A sculptural wool tunic with asymmetric paneling, exposed construction, and a softened drape that moves between tailoring and abstraction.",
  gallery: [
    {
      alt: "Front view of the deconstructed wool tunic in charcoal wool with an asymmetric hem and exposed seam lines.",
      caption: "Front panel / drape study",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBEaHEnJU7iBO7KMPJ1hx2nIQ8y94R3ILJSBmd4H8FRTmMK-iTGXuFWyIyrOLj73q9BAhX2OjyDXeXBWwCoXGHHJgEHh9lRuv0YNnLcdImDtIc2sDDdbps_RlwQdqiIc-a0PtObZQOvUpC35UZwZm_25xz6DDmpYZobjBSViHv26bC7XAKrcinpgHSAqdWI_YMAbOQGadrWyDhh2dP_yEXrvdaK40URzmln4xkabsGUEJ31_qeuC0uRRWcDIkclgANEgqdNJ13L0fbS",
      size: "wide",
    },
    {
      alt: "Side profile showing the tunic's cropped sleeve and layered understructure against a neutral studio backdrop.",
      caption: "Side profile / sleeve volume",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDYSO3JwCiYn_wHYdjF6Zyr_giDrOoUOWK8jLqy1zSDL9HkagSgJvsQzlHf8gQX55LsEffyXPAx_tUuc0Ciu0iMWuBcKVQLAlJc8pDTN1tutmONVfgH6KAbbwMyljyrEia8wsNqNdP2DiuDJtSafgL9MVLFqWO-BabwXFKeQaLbD2v-4ApHnzClhxQFiFlzSEhOnxbg_QwarIiGsY2KHnzngz9KvfU_y0MvlbJqfK8l5vEgKwId3rvL8g5X7wd1oeaWgx_Ia5mB1JQv",
      size: "square",
    },
    {
      alt: "Detail crop of the wool surface and stitched construction at the shoulder and neckline.",
      caption: "Construction / shoulder detail",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCgKJH_4uYDvSIQTgeTGYmD6CrgLJQAsR05JTDfv4K9K0UJ0f6J5uyWobmshtX-oCMQAV_qj28Hlk2gqv8_ErSOgdvqoAYmheu_iFiVUTXmWRI9yzDcXyCtU8ztcqFiNdE11oqOoz8ARcwVRCZVJ2G6BkhJECGvexgxP8K5Frd31VM-bfHn4abnr2Nu1VpY6gtIa8O2zaZXG-_-4oLTD5wTUBBHkxvDwh5BoNpnTliJ4AKZO9hrE-qITFXJUsPWq06TvgLHkfrAS0Su",
      size: "tall",
    },
    {
      alt: "Back view of the tunic showing the elongated hem and subtle asymmetry in the drape.",
      caption: "Back view / hemline",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAvJmmx9M3eVKKs70St1e9yxMfYGIlKo9gtzSxWEf3Qa-3cWrPcpkcSyCHwo6XRIgvKyXkhUYROaz0Q-KIjO8lmZX-TJOCg4Bl1Tfy-lKY1dMMnZpCLEG67TIEPZ6wXGznKDi4Ft6yjnmakfmsyO3hn7fejwsiOKgD1W-hCXLw-hWGVBwByAOujtYK7FKNCABjpvgPNtkHB6OmbKcxoG1ymp3qgN-JJWGT4DoZiivzB4d88UAKW81aJDg9NSwIX1dedNg0E5syEGI68",
      size: "wide",
    },
  ],
  materials: "100% wool with cotton reinforcement at the interior seams.",
  note: "One-piece archive release from a private European collection.",
  price: "€1,450",
  provenance: "Acquired from a long-term collector in Antwerp, Belgium.",
  relatedItems: [
    {
      brand: "Comme des Garcons",
      imageAlt:
        "Black wool jacket with sculpted lapels and angular shoulders in a studio portrait.",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBEaHEnJU7iBO7KMPJ1hx2nIQ8y94R3ILJSBmd4H8FRTmMK-iTGXuFWyIyrOLj73q9BAhX2OjyDXeXBWwCoXGHHJgEHh9lRuv0YNnLcdImDtIc2sDDdbps_RlwQdqiIc-a0PtObZQOvUpC35UZwZm_25xz6DDmpYZobjBSViHv26bC7XAKrcinpgHSAqdWI_YMAbOQGadrWyDhh2dP_yEXrvdaK40URzmln4xkabsGUEJ31_qeuC0uRRWcDIkclgANEgqdNJ13L0fbS",
      price: "€980",
      title: "Tailored Wool Jacket",
    },
    {
      brand: "Ann Demeulemeester",
      imageAlt:
        "Long black sleeveless coat with soft lapels and a layered drape hanging in soft light.",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAUvrpP7YcFEpsZ7cpwDL42xxgRETlnQOIhCoQrgLWeGGidHoQkJ_qQ4ciyhhqGE_uhb9VYRPTRbHTw-TOoqlgNImTik8_ia7ZC-t4ETKYfgvpXrc_clsC3h7KIWxsPkHsM2anK_uQII-gzbRUrYwONjEd6LxZBQtDYMj2xKm2-BZnR1ieplefbGXIB30p6u4xFj_zd2qCpJ436BU4vcUGH6IL6uCXbfEasbe1MXOu_SfY6_zzDAZVPhinU4_PZH0EEDyKNMl8JMWn7",
      price: "€1,120",
      title: "Layered Sleeveless Coat",
    },
    {
      brand: "Jil Sander",
      imageAlt:
        "Minimal wool top with precise seams and a clean shoulder line in a muted studio setting.",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB35bPh3FQZgHqvh26Gw7-hjUdxrZDvpi8wF900NB5geLKwBTcZSJEUosd-Bwydl0sPRJBYkWzo2LVpe5BTyYkB2pDCT05aC2tByHQnnGJTvWcTtHnmbvvzJSB6xScSvw7RKnOmGtpWNt5-LX7JQDvv4DL3Y0ax3yNuq2YY-01QJUOXG5lwpSQ0oqDm3kYMd6B6gLn0ffYxjAuIYewTFuicG2ZjAMn6qEpMQ1AsmdKqEox9AAScDtORKMGhcBxADMeqqqFED2wdQSVs",
      price: "€760",
      title: "Precision Wool Top",
    },
  ],
  slug: "deconstructed-wool-tunic",
  title: "Deconstructed Wool Tunic",
  authenticationNote: "ZEITLESS authentication card included with purchase.",
};

export const storyContent = {
  eyebrow: "The Curatorial Vision",
  title: "Preserving the Unseen",
  body: "Every piece in the ZEITLESS archive is hand-selected for its historical significance and artistic merit. We do not just sell clothes; we curate a legacy of design that speaks across generations.",
  quote: "Fashion is the armor to survive the reality of everyday life.",
  quoteAttribution: "— Bill Cunningham",
  imageAlt: "Editorial fashion portrait against a brutalist concrete wall",
  imageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD1sP_UF4qxbNAzfXEArsdMOy5uboj9qLAnz-uLMRKBLcxG0Saumub_fpUKM0gjA-SQDvsR7o3sCg6LM9NVUMjHgdOFV1aCTkb76Fe0A58RtDziqOKTuAsXPa7nw9jTRh14Qia5PCDHztIHKY_URK-4t68ZfSm66CSMPji3YTt3-SlRXXCwsUuA8bMtRbLyzK5rGetmmbvxsP5EBudilD66NGhbK0JR-wURxD8r-YcYR4_FUnZJcJCo37VWRmARo0qq85GUXcoPJpzN",
  linkHref: "#manifest",
  linkLabel: "Read our manifest",
};

export const newsletterContent = {
  title: "Join the Archive Circle",
  body: "Receive early access to rare drops and private curation events.",
  placeholder: "YOUR EMAIL ADDRESS",
  submitLabel: "Subscribe",
};

export const footerLinks = [
  { href: "#", label: "Newsletter" },
  { href: "#", label: "Instagram" },
  { href: "#", label: "Archive Policy" },
  { href: "#", label: "Privacy" },
];
