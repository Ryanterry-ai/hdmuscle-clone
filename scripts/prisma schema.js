bash

cat > /home/claude/hdmuscle-cms/prisma/schema.prisma << 'PRISMAEOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum AdminRole { SUPER_ADMIN SITE_ADMIN EDITOR VIEWER }
enum SiteStatus { ACTIVE INACTIVE SUSPENDED }
enum PublishStatus { DRAFT PUBLISHED ARCHIVED }
enum ProductStatus { DRAFT ACTIVE ARCHIVED }
enum OrderStatus { PENDING_PAYMENT PAID PROCESSING SHIPPED DELIVERED CANCELLED REFUND_INITIATED REFUNDED PAYMENT_FAILED }
enum PaymentStatus { PENDING CAPTURED FAILED REFUNDED }
enum ImportStatus { PENDING IN_PROGRESS PREVIEW_READY APPLIED FAILED }
enum ImportSourceType { URL CSV JSON }
enum BlockType { HeroBlock PromoStripBlock ProductGridBlock CollectionShowcaseBlock FeatureListBlock RichTextBlock FAQBlock TestimonialBlock CTASectionBlock ImageBannerBlock AnnouncementBarBlock TrustBadgesBlock NewsletterBlock PolicyTextBlock BlogPostGridBlock FormBlock CustomHTMLBlock }
enum NavigationLocation { HEADER FOOTER MOBILE SIDEBAR }

model Site {
  id             String     @id @default(cuid())
  name           String
  domain         String     @unique
  slug           String     @unique
  status         SiteStatus @default(ACTIVE)
  enabledModules String[]   @default([])
  settings       Json       @default("{}")
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  adminAccess    AdminSiteAccess[]
  pages          Page[]
  contentBlocks  ContentBlock[]
  navigations    Navigation[]
  announcements  Announcement[]
  seoSettings    SeoSetting[]
  products       Product[]
  collections    Collection[]
  orders         Order[]
  customers      Customer[]
  blogPosts      BlogPost[]
  blogAuthors    BlogAuthor[]
  blogTags       BlogTag[]
  mediaAssets    MediaAsset[]
  importJobs     ImportJob[]
  auditLogs      AuditLog[]
  @@index([domain])
  @@map("sites")
}

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         AdminRole @default(EDITOR)
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  siteAccess   AdminSiteAccess[]
  importJobs   ImportJob[]
  auditLogs    AuditLog[]
  @@map("admin_users")
}

model AdminSiteAccess {
  id        String   @id @default(cuid())
  adminId   String
  siteId    String
  createdAt DateTime @default(now())
  admin     AdminUser @relation(fields: [adminId], references: [id], onDelete: Cascade)
  site      Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@unique([adminId, siteId])
  @@map("admin_site_access")
}

model Page {
  id           String        @id @default(cuid())
  siteId       String
  title        String
  slug         String
  status       PublishStatus @default(DRAFT)
  isHomepage   Boolean       @default(false)
  metaTitle    String?
  metaDesc     String?
  ogImage      String?
  canonicalUrl String?
  robots       String?       @default("index,follow")
  publishedAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  site         Site          @relation(fields: [siteId], references: [id], onDelete: Cascade)
  blocks       ContentBlock[]
  @@unique([siteId, slug])
  @@index([siteId, status])
  @@index([siteId, isHomepage])
  @@map("pages")
}

model ContentBlock {
  id        String        @id @default(cuid())
  siteId    String
  pageId    String?
  blockType BlockType
  blockData Json
  order     Int           @default(0)
  status    PublishStatus @default(DRAFT)
  label     String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  site      Site          @relation(fields: [siteId], references: [id], onDelete: Cascade)
  page      Page?         @relation(fields: [pageId], references: [id], onDelete: SetNull)
  @@index([siteId, pageId, order])
  @@map("content_blocks")
}

model Navigation {
  id        String             @id @default(cuid())
  siteId    String
  location  NavigationLocation
  label     String             @default("Navigation")
  items     Json
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
  site      Site               @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@unique([siteId, location])
  @@map("navigations")
}

model Announcement {
  id        String    @id @default(cuid())
  siteId    String
  text      String
  link      String?
  linkText  String?
  isActive  Boolean   @default(true)
  startsAt  DateTime?
  endsAt    DateTime?
  priority  Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  site      Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@index([siteId, isActive])
  @@map("announcements")
}

model SeoSetting {
  id              String   @id @default(cuid())
  siteId          String
  pageType        String
  refId           String?
  metaTitle       String?
  metaDescription String?
  ogTitle         String?
  ogDescription   String?
  ogImage         String?
  canonicalUrl    String?
  robots          String?  @default("index,follow")
  structuredData  Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  site            Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@unique([siteId, pageType, refId])
  @@map("seo_settings")
}

model BlogAuthor {
  id        String     @id @default(cuid())
  siteId    String
  name      String
  slug      String
  bio       String?
  avatarUrl String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  site      Site       @relation(fields: [siteId], references: [id], onDelete: Cascade)
  posts     BlogPost[]
  @@unique([siteId, slug])
  @@map("blog_authors")
}

model BlogTag {
  id        String          @id @default(cuid())
  siteId    String
  name      String
  slug      String
  createdAt DateTime        @default(now())
  site      Site            @relation(fields: [siteId], references: [id], onDelete: Cascade)
  posts     BlogPostToTag[]
  @@unique([siteId, slug])
  @@map("blog_tags")
}

model BlogPost {
  id            String          @id @default(cuid())
  siteId        String
  authorId      String?
  title         String
  slug          String
  excerpt       String?
  content       String
  coverImageUrl String?
  status        PublishStatus   @default(DRAFT)
  metaTitle     String?
  metaDesc      String?
  publishedAt   DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  site          Site            @relation(fields: [siteId], references: [id], onDelete: Cascade)
  author        BlogAuthor?     @relation(fields: [authorId], references: [id], onDelete: SetNull)
  tags          BlogPostToTag[]
  @@unique([siteId, slug])
  @@index([siteId, status])
  @@map("blog_posts")
}

model BlogPostToTag {
  postId String
  tagId  String
  post   BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    BlogTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([postId, tagId])
  @@map("blog_post_tags")
}

model Collection {
  id          String             @id @default(cuid())
  siteId      String
  name        String
  slug        String
  description String?
  imageUrl    String?
  status      PublishStatus      @default(DRAFT)
  order       Int                @default(0)
  metaTitle   String?
  metaDesc    String?
  externalId  String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  site        Site               @relation(fields: [siteId], references: [id], onDelete: Cascade)
  products    ProductCollection[]
  @@unique([siteId, slug])
  @@index([siteId, status])
  @@map("collections")
}

model Product {
  id               String             @id @default(cuid())
  siteId           String
  name             String
  slug             String
  description      String?
  shortDescription String?
  status           ProductStatus      @default(DRAFT)
  isFeatured       Boolean            @default(false)
  optionNames      String[]           @default([])
  imageUrls        String[]           @default([])
  tags             String[]           @default([])
  metaTitle        String?
  metaDesc         String?
  externalId       String?
  manualOverride   String[]           @default([])
  publishedAt      DateTime?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  site             Site               @relation(fields: [siteId], references: [id], onDelete: Cascade)
  variants         ProductVariant[]
  collections      ProductCollection[]
  @@unique([siteId, slug])
  @@index([siteId, status])
  @@index([siteId, isFeatured])
  @@map("products")
}

model ProductVariant {
  id                Int      @id @default(autoincrement())
  variantId         String   @unique @default(cuid())
  productId         String
  sku               String?
  title             String
  options           Json     @default("[]")
  price             Int
  compareAtPrice    Int?
  costPrice         Int?
  stock             Int      @default(0)
  lowStockThreshold Int?     @default(5)
  isAvailable       Boolean  @default(true)
  weight            Float?
  imageUrl          String?
  order             Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  product           Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems        OrderItem[]
  @@index([productId])
  @@map("product_variants")
}

model ProductCollection {
  productId    String
  collectionId String
  order        Int    @default(0)
  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  @@id([productId, collectionId])
  @@map("product_collections")
}

model Customer {
  id               String    @id @default(cuid())
  siteId           String
  email            String
  firstName        String
  lastName         String?
  phone            String?
  passwordHash     String?
  isGuest          Boolean   @default(true)
  acceptsMarketing Boolean   @default(false)
  totalOrders      Int       @default(0)
  totalSpent       Int       @default(0)
  notes            String?
  tags             String[]  @default([])
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  site             Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  orders           Order[]
  addresses        Address[]
  @@unique([siteId, email])
  @@index([siteId])
  @@map("customers")
}

model Address {
  id         String   @id @default(cuid())
  customerId String
  type       String   @default("shipping")
  firstName  String
  lastName   String?
  line1      String
  line2      String?
  city       String
  state      String
  pincode    String
  country    String   @default("India")
  phone      String?
  isDefault  Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  @@index([customerId])
  @@map("addresses")
}

model Order {
  id              String      @id @default(cuid())
  siteId          String
  orderNumber     String
  customerId      String?
  status          OrderStatus @default(PENDING_PAYMENT)
  customerEmail   String
  customerName    String
  customerPhone   String?
  shippingLine1   String
  shippingLine2   String?
  shippingCity    String
  shippingState   String
  shippingPincode String
  shippingCountry String      @default("India")
  billingLine1    String?
  billingCity     String?
  billingState    String?
  billingPincode  String?
  subtotal        Int
  discountAmount  Int         @default(0)
  shippingAmount  Int         @default(0)
  taxAmount       Int         @default(0)
  totalAmount     Int
  razorpayOrderId String?     @unique
  couponCode      String?
  notes           String?
  trackingNumber  String?
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  site            Site            @relation(fields: [siteId], references: [id], onDelete: Cascade)
  customer        Customer?       @relation(fields: [customerId], references: [id], onDelete: SetNull)
  items           OrderItem[]
  payments        Payment[]
  timeline        OrderTimeline[]
  @@unique([siteId, orderNumber])
  @@index([siteId, status])
  @@index([razorpayOrderId])
  @@map("orders")
}

model OrderItem {
  id           String          @id @default(cuid())
  orderId      String
  variantId    String?
  productName  String
  variantTitle String?
  sku          String?
  options      Json            @default("[]")
  quantity     Int
  unitPrice    Int
  totalPrice   Int
  imageUrl     String?
  createdAt    DateTime        @default(now())
  order        Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant      ProductVariant? @relation(fields: [variantId], references: [variantId], onDelete: SetNull)
  @@index([orderId])
  @@map("order_items")
}

model Payment {
  id                String        @id @default(cuid())
  orderId           String
  razorpayOrderId   String
  razorpayPaymentId String?       @unique
  amount            Int
  currency          String        @default("INR")
  status            PaymentStatus @default(PENDING)
  method            String?
  errorCode         String?
  errorDescription  String?
  capturedAt        DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  order             Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId])
  @@map("payments")
}

model OrderTimeline {
  id        String   @id @default(cuid())
  orderId   String
  event     String
  notes     String?
  createdBy String?
  createdAt DateTime @default(now())
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId])
  @@map("order_timeline")
}

model MediaAsset {
  id         String   @id @default(cuid())
  siteId     String
  url        String
  publicId   String?
  filename   String
  mimeType   String
  sizeBytes  Int?
  width      Int?
  height     Int?
  altText    String?
  folder     String?
  uploadedBy String?
  createdAt  DateTime @default(now())
  site       Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@index([siteId])
  @@map("media_assets")
}

model ImportJob {
  id            String           @id @default(cuid())
  siteId        String
  sourceType    ImportSourceType
  sourceUrl     String?
  status        ImportStatus     @default(PENDING)
  previewData   Json?
  resultSummary Json?
  errors        Json?
  initiatedBy   String
  appliedAt     DateTime?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  site          Site             @relation(fields: [siteId], references: [id], onDelete: Cascade)
  admin         AdminUser        @relation(fields: [initiatedBy], references: [id])
  @@index([siteId, status])
  @@map("import_jobs")
}

model AuditLog {
  id         String   @id @default(cuid())
  siteId     String?
  adminId    String?
  action     String
  entityType String?
  entityId   String?
  oldData    Json?
  newData    Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
  site       Site?      @relation(fields: [siteId], references: [id], onDelete: SetNull)
  admin      AdminUser? @relation(fields: [adminId], references: [id], onDelete: SetNull)
  @@index([siteId, createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
PRISMAEOF
echo "schema written"
Output

schema written
