const WORDPRESS_HOST = "hasselbladslivs.se";

const redirects = `
[[redirects]]
  from = "/varukorg"
  to = "/webbutik"
  status = 301

[[redirects]]
  from = "/cart"
  to = "/webbutik"
  status = 301
`;

console.log(redirects);
