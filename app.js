/* Toko NASA demo storefront.
   Ganti WHATSAPP_NUMBER di bawah dengan nomor admin format internasional tanpa + atau spasi.
   Produk dan harga di bawah adalah data contoh; sesuaikan dengan katalog asli Anda. */
const WHATSAPP_NUMBER = "6281234567890";
const STORE_NAME = "Toko NASA";
const products = [
  {id:1,name:"Paket Perawatan Tanaman",category:"Pertanian",price:85000,icon:"plant.svg",tag:"Pilihan",bg:"#dff0df",description:"Paket contoh untuk melengkapi kebutuhan perawatan tanaman. Konfirmasi isi paket dan petunjuk penggunaan kepada admin."},
  {id:2,name:"Nutrisi Tanaman",category:"Pertanian",price:65000,icon:"plant.svg",tag:"Favorit",bg:"#e3f1d9",description:"Produk katalog contoh untuk kategori pertanian. Detail komposisi, dosis, dan kecocokan tanaman perlu dikonfirmasi."},
  {id:3,name:"Pembersih Rumah",category:"Rumah Tangga",price:35000,icon:"clean.svg",tag:"",bg:"#e0edf8",description:"Contoh produk kategori rumah tangga. Baca label resmi dan ikuti petunjuk pemakaian dari produsen."},
  {id:4,name:"Paket Kebersihan",category:"Rumah Tangga",price:59000,icon:"clean.svg",tag:"Paket",bg:"#e1f4f4",description:"Paket contoh kebutuhan kebersihan sehari-hari. Isi paket dapat disesuaikan dengan katalog toko."},
  {id:5,name:"Perawatan Tubuh",category:"Perawatan Diri",price:48000,icon:"body.svg",tag:"",bg:"#f7e8df",description:"Contoh produk perawatan diri. Periksa bahan, label, dan kecocokan produk sebelum digunakan."},
  {id:6,name:"Paket Perawatan Diri",category:"Perawatan Diri",price:99000,icon:"body.svg",tag:"Paket",bg:"#f7e4eb",description:"Paket contoh kategori perawatan diri. Konfirmasikan varian dan isi paket yang tersedia kepada admin."},
  {id:7,name:"Produk Kesehatan",category:"Kesehatan",price:75000,icon:"health.svg",tag:"",bg:"#e5f0e6",description:"Contoh tampilan produk kategori kesehatan. Jangan gunakan untuk mendiagnosis atau mengobati penyakit; cek label resmi."},
  {id:8,name:"Paket Produk Pilihan",category:"Paket Hemat",price:125000,icon:"gift.svg",tag:"Paket",bg:"#f5edd8",description:"Paket contoh dengan beberapa produk pilihan. Rincian isi, stok, dan harga akhir dikonfirmasi admin."}
];
const $ = (s) => document.querySelector(s);
const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
let activeCategory = "Semua";
let cart = JSON.parse(localStorage.getItem("tokoNasaCart") || "{}");
let modalProduct = null, modalQty = 1, toastTimer;
const categories = ["Semua",...new Set(products.map(p=>p.category))];

function persist(){localStorage.setItem("tokoNasaCart",JSON.stringify(cart));renderCart();updateCartCount();}
function updateCartCount(){$("#cartCount").textContent=Object.values(cart).reduce((a,b)=>a+b,0);}
function showToast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300);}
function renderCategories(){
  $("#categoryList").innerHTML=categories.map(c=>`<button class="category-chip ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
}
function getVisibleProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  let list=products.filter(p=>(activeCategory==="Semua"||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.description}`).toLowerCase().includes(q));
  const sort=$("#sortSelect").value;
  if(sort==="low")list.sort((a,b)=>a.price-b.price);
  if(sort==="high")list.sort((a,b)=>b.price-a.price);
  if(sort==="az")list.sort((a,b)=>a.name.localeCompare(b.name,"id"));
  return list;
}
function renderProducts(){
  const list=getVisibleProducts();
  $("#productCount").textContent=list.length;
  $("#emptyState").hidden=!!list.length;
  $("#productGrid").innerHTML=list.map(p=>`<article class="product-card">
    <div class="product-visual" data-detail="${p.id}" style="background:${p.bg}">${p.tag?`<span class="product-tag">${p.tag}</span>`:""}<span class="product-emoji"><img src="assets/${p.icon}" alt=""></span></div>
    <div class="product-info"><span class="product-category">${p.category}</span><h3 data-detail="${p.id}">${p.name}</h3><div class="product-description">${p.description}</div>
    <div class="product-bottom"><strong class="product-price">${rupiah(p.price)}</strong><button class="add-button" data-add="${p.id}" aria-label="Tambah ${p.name} ke keranjang">+</button></div></div></article>`).join("");
}
function addToCart(id,qty=1){cart[id]=(cart[id]||0)+qty;persist();showToast("Produk ditambahkan ke keranjang.");}
function renderCart(){
  const entries=Object.entries(cart).filter(([id,qty])=>products.some(p=>p.id===Number(id))&&qty>0);
  const count=entries.reduce((s,[,q])=>s+q,0);
  $("#cartEmpty").style.display=count?"none":"block";
  $("#drawerFooter").style.display=count?"block":"none";
  $("#cartItems").innerHTML=entries.map(([id,qty])=>{const p=products.find(x=>x.id===Number(id));return `<div class="cart-row"><div class="cart-thumb" style="background:${p.bg}"><img src="assets/${p.icon}" alt=""></div><div><h4>${p.name}</h4><small>${rupiah(p.price)} / produk</small><div class="mini-qty"><button data-cart-minus="${p.id}" aria-label="Kurangi ${p.name}">−</button><span>${qty}</span><button data-cart-plus="${p.id}" aria-label="Tambah ${p.name}">+</button><button class="remove-item" data-remove="${p.id}">Hapus</button></div></div><strong style="font-size:11px;white-space:nowrap">${rupiah(p.price*qty)}</strong></div>`}).join("");
  const subtotal=entries.reduce((sum,[id,q])=>sum+products.find(p=>p.id===Number(id)).price*q,0);
  $("#cartSubtotal").textContent=rupiah(subtotal);
  updateCartCount();
}
function openCart(){$("#overlay").classList.add("open");$("#cartDrawer").classList.add("open");$("#cartDrawer").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeCart(){$("#overlay").classList.remove("open");$("#cartDrawer").classList.remove("open");$("#cartDrawer").setAttribute("aria-hidden","true");document.body.style.overflow="";}
function openProduct(id){
  modalProduct=products.find(p=>p.id===Number(id));if(!modalProduct)return;modalQty=1;
  $("#modalArt").style.background=modalProduct.bg;$("#modalArt").innerHTML=`<span><img src="assets/${modalProduct.icon}" alt=""></span>`;
  $("#modalCategory").textContent=modalProduct.category;$("#modalTitle").textContent=modalProduct.name;$("#modalPrice").textContent=rupiah(modalProduct.price);$("#modalDescription").textContent=modalProduct.description;$("#modalQty").textContent=modalQty;
  $("#productModalBackdrop").classList.add("open");document.body.style.overflow="hidden";
}
function closeProduct(){ $("#productModalBackdrop").classList.remove("open");document.body.style.overflow=""; }
function sendWhatsApp(message){const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;window.open(url,"_blank","noopener,noreferrer");}
function checkout(){
  const entries=Object.entries(cart).filter(([id,q])=>q>0&&products.some(p=>p.id===Number(id)));
  if(!entries.length){showToast("Keranjang masih kosong.");return;}
  const lines=entries.map(([id,q])=>{const p=products.find(x=>x.id===Number(id));return `• ${p.name} x${q} — ${rupiah(p.price*q)}`;});
  const total=entries.reduce((s,[id,q])=>s+products.find(p=>p.id===Number(id)).price*q,0);
  const message=`Halo admin ${STORE_NAME}, saya ingin menanyakan/memesan produk berikut:\n\n${lines.join("\n")}\n\nPerkiraan subtotal: ${rupiah(total)}\n\nMohon konfirmasi stok, harga terbaru, ongkir, dan cara pembayaran. Nama penerima:\nAlamat pengiriman:\nMetode pembayaran:`;
  sendWhatsApp(message);
}
$("#categoryList").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;renderCategories();renderProducts();});
$("#productGrid").addEventListener("click",e=>{const add=e.target.closest("[data-add]");if(add){addToCart(Number(add.dataset.add));return;}const detail=e.target.closest("[data-detail]");if(detail)openProduct(detail.dataset.detail);});
$("#searchInput").addEventListener("input",renderProducts);$("#sortSelect").addEventListener("change",renderProducts);
$("#resetFilters").addEventListener("click",()=>{$("#searchInput").value="";$("#sortSelect").value="featured";activeCategory="Semua";renderCategories();renderProducts();});
$("#openCart").addEventListener("click",openCart);$("#closeCart").addEventListener("click",closeCart);$("#overlay").addEventListener("click",closeCart);
$("#cartItems").addEventListener("click",e=>{
  const plus=e.target.closest("[data-cart-plus]"),minus=e.target.closest("[data-cart-minus]"),remove=e.target.closest("[data-remove]");
  if(plus){cart[plus.dataset.cartPlus]=(cart[plus.dataset.cartPlus]||0)+1;}
  if(minus){const id=minus.dataset.cartMinus;cart[id]=(cart[id]||0)-1;if(cart[id]<=0)delete cart[id];}
  if(remove)delete cart[remove.dataset.remove];persist();
});
$("#clearCart").addEventListener("click",()=>{cart={};persist();showToast("Keranjang dikosongkan.");});
$("#checkoutButton").addEventListener("click",checkout);
$("#closeProductModal").addEventListener("click",closeProduct);
$("#productModalBackdrop").addEventListener("click",e=>{if(e.target===$("#productModalBackdrop"))closeProduct();});
$("#modalMinus").addEventListener("click",()=>{modalQty=Math.max(1,modalQty-1);$("#modalQty").textContent=modalQty;});
$("#modalPlus").addEventListener("click",()=>{modalQty=Math.min(99,modalQty+1);$("#modalQty").textContent=modalQty;});
$("#modalAdd").addEventListener("click",()=>{if(modalProduct)addToCart(modalProduct.id,modalQty);closeProduct();});
$("#contactAdmin").addEventListener("click",()=>sendWhatsApp(`Halo admin ${STORE_NAME}, saya ingin bertanya tentang produk dan pemesanan.`));
$("#focusSearch").addEventListener("click",()=>{$("#searchInput").focus();$("#produk").scrollIntoView({behavior:"smooth"});});
$("#menuToggle").addEventListener("click",()=>{const nav=$(".desktop-nav");const isOpen=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(isOpen));});
$(".desktop-nav").addEventListener("click",e=>{if(e.target.closest("a")){$(".desktop-nav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeProduct();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#searchInput").focus();$("#produk").scrollIntoView({behavior:"smooth"});}});
$("#year").textContent=new Date().getFullYear();
renderCategories();renderProducts();renderCart();
