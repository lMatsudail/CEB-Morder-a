#IdentidaddeMarcaCEB-Documentación

##PaletadeColoresOficial

Laaplicaciónutiliza**exclusivamente**estostrescoloresentodalainterfaz:

###ColoresPrincipales

|Color|CódigoHex|VariableCSS|Uso|
|-------|-----------|--------------|-----|
|**Negro**|`#000000`|`var(--brand-black)`|Fondos,textoprincipal,bordes|
|**Blanco**|`#ffffff`|`var(--brand-white)`|Fondos,textosobrenegro|
|**Amarillo**|`#fcc801`|`var(--brand-yellow)`|Acentos,botonesprimarios,highlights|

##TipografíaOficial

###FuentePrincipal:Montserrat

Todalaaplicaciónutiliza**Montserrat**comofuenteúnica:

|Elemento|Peso|VariableCSS|Uso|
|----------|------|--------------|-----|
|**Títulos**|ExtraBold(800)|`var(--font-weight-extrabold)`|h1,h2,h3,títulosprincipales|
|**Información**|Medium(500)|`var(--font-weight-medium)`|Textonormal,párrafos,labels|
|Subtítulos|Bold(700)|`var(--font-weight-bold)`|Botones,subtítulos|
|Énfasis|Semibold(600)|`var(--font-weight-semibold)`|Textosimportantes|
|Regular|Regular(400)|`var(--font-weight-regular)`|Textossecundarios|

##SistemadeVariablesCSS

###ArchivoPrincipal:`src/styles/brand.css`

Estearchivocontiene**todaslasvariablesdemarca**ydebeserimportadoencualquiernuevocomponente.

###VariablesdeColor

```css
/*Coloresdemarca*/
--brand-black:#000000;
--brand-white:#ffffff;
--brand-yellow:#fcc801;

/*Coloresfuncionales*/
--color-primary:#000000;
--color-secondary:#fcc801;
--color-background:#ffffff;
--color-text-primary:#000000;
--color-text-secondary:#ffffff;
--color-text-accent:#fcc801;
```

###VariablesdeTipografía

```css
--font-family:'Montserrat',sans-serif;
--font-weight-regular:400;
--font-weight-medium:500;
--font-weight-semibold:600;
--font-weight-bold:700;
--font-weight-extrabold:800;
--font-weight-black:900;
```

###VariablesdeEspaciado

```css
--spacing-xs:0.25rem;/*4px*/
--spacing-sm:0.5rem;/*8px*/
--spacing-md:1rem;/*16px*/
--spacing-lg:1.5rem;/*24px*/
--spacing-xl:2rem;/*32px*/
--spacing-2xl:3rem;/*48px*/
--spacing-3xl:4rem;/*64px*/
```

###VariablesdeSombra

```css
--shadow-sm:02px4pxrgba(0,0,0,0.1);
--shadow-md:04px8pxrgba(0,0,0,0.15);
--shadow-lg:08px16pxrgba(0,0,0,0.2);
--shadow-xl:012px24pxrgba(0,0,0,0.25);
--shadow-yellow:04px12pxrgba(252,200,1,0.3);
```

##ComponentesdeUI

###Botones

####BotónPrimario(Amarillo)
```css
.btn-primary{
background-color:var(--brand-yellow);
color:var(--brand-black);
border:2pxsolidvar(--brand-black);
}
```

####BotónSecundario(Negro)
```css
.btn-secondary{
background-color:var(--brand-black);
color:var(--brand-white);
border:2pxsolidvar(--brand-black);
}
```

####BotónOutline
```css
.btn-outline{
background-color:transparent;
color:var(--brand-black);
border:2pxsolidvar(--brand-black);
}
```

###Cards

```css
.card{
background-color:var(--brand-white);
border:2pxsolidvar(--brand-black);
color:var(--brand-black);
}

.card:hover{
border-color:var(--brand-yellow);
box-shadow:var(--shadow-yellow);
}
```

###InputsyFormularios

```css
input,textarea,select{
background-color:var(--brand-white);
color:var(--brand-black);
border:2pxsolidvar(--gray-border);
}

input:focus{
border-color:var(--brand-black);
box-shadow:0003pxrgba(252,200,1,0.2);
}
```

##ArchivosModificados

###ArchivosPrincipales
-✅`src/styles/brand.css`(NUEVO-Sistemadevariables)
-✅`src/styles/index.css`(Actualizado)
-✅`src/styles/App.css`

###ComponentesdeLayout
-✅`src/components/layout/Navbar/Navbar.css`
-✅`src/components/layout/Footer/Footer.css`

###PáginasPrincipales
-✅`src/pages/home/Home.css`
-✅`src/pages/auth/Login/Login.css`
-✅`src/pages/auth/Register/Register.css`
-✅`src/pages/auth/Auth.css`

###Dashboards
-✅`src/pages/dashboard/PatronistaPanel/PatronistaPanel.css`
-✅`src/pages/dashboard/AdminPanel/AdminPanel.css`
-✅`src/pages/dashboard/ClientePanel/ClientePanel.css`
-✅`src/pages/dashboard/Dashboard/Dashboard.css`

###Tienda
-✅`src/pages/shop/Cart/Cart.css`
-✅`src/pages/shop/Catalog/Catalog.css`
-✅`src/pages/shop/Checkout/Checkout.css`
-✅`src/pages/shop/OrderConfirmation/OrderConfirmation.css`
-✅`src/pages/shop/ProductDetail/ProductDetail.css`

###Componentes
-✅`src/components/ProductModal/ProductModal.css`
-✅`src/components/forms/AddProductForm/AddProductForm.css`

##EstadísticasdeCambios

-**321**coloresactualizados
-**14**archivosdefuentesmodificados
-**71**variablesCSSactualizadas
-**21**archivosCSStotalesmodificados
-**100%**delaaplicaciónusandoidentidaddemarca

##GuíadeUsoparaNuevosComponentes

###1.ImportarVariables
```css
/*EnelarchivoCSSdetucomponente*/
@import'../../styles/brand.css';/*Ajustalarutasegúnubicación*/
```

###2.UsarVariablesdeMarca
```css
.mi-componente{
background-color:var(--brand-white);
color:var(--brand-black);
border:2pxsolidvar(--brand-yellow);
font-family:var(--font-family);
font-weight:var(--font-weight-medium);
padding:var(--spacing-lg);
box-shadow:var(--shadow-md);
}

.mi-titulo{
color:var(--brand-black);
font-weight:var(--font-weight-extrabold);
font-size:var(--font-size-3xl);
}
```

###3.ClasesAuxiliaresDisponibles
```css
/*Coloresdetexto*/
.text-black{color:var(--brand-black)!important;}
.text-white{color:var(--brand-white)!important;}
.text-yellow{color:var(--brand-yellow)!important;}

/*Coloresdefondo*/
.bg-black{background-color:var(--brand-black)!important;}
.bg-white{background-color:var(--brand-white)!important;}
.bg-yellow{background-color:var(--brand-yellow)!important;}

/*Pesosdefuente*/
.text-extrabold{font-weight:var(--font-weight-extrabold);}
.text-bold{font-weight:var(--font-weight-bold);}
.text-medium{font-weight:var(--font-weight-medium);}

/*Secciones*/
.section-black{background-color:var(--brand-black);color:var(--brand-white);}
.section-white{background-color:var(--brand-white);color:var(--brand-black);}
.section-yellow{background-color:var(--brand-yellow);color:var(--brand-black);}
```

##ReglasImportantes

###❌NOUSAR:
-Coloresazules,verdes,rojos,morados(exceptoenestadosdeerror)
-FuentesdiferentesaMontserrat
-Gradientesmulticolor
-Coloresgrisesintermedios(usarnegrooblanco)

###✅SIEMPREUSAR:
-VariablesCSSenlugardevaloresdirectos
-Negro(#000000)paratextosybordesprincipales
-Blanco(#ffffff)parafondosytextosobrenegro
-Amarillo(#fcc801)paraacentos,botonesCTAyhighlights
-Montserratparatodalatipografía
-ExtraBold(800)paratítulos
-Medium(500)paratextonormal

##EjemplosdeUso

###Navbar
-Fondo:Negro
-Texto:Blanco
-Bordeinferior:Amarillo
-Logohover:Amarillo

###BotonesPrimarios
-Fondo:Amarillo
-Texto:Negro
-Borde:Negro
-Hover:Amarillomásoscuro+sombraamarilla

###CardsdeProducto
-Fondo:Blanco
-Texto:Negro
-Borde:Negro
-Hover:Bordeamarillo+sombraamarilla

###DashboardPatronistaPanel
-Statscards:Amarillocontextonegro
-Tabsactivos:Negrocontextoblanco
-Bordes:Amarilloparaelementosactivos

##ResponsiveDesign

Todaslasvariablesdeespaciadoestándiseñadasparafuncionarendispositivosmóviles:

```css
@media(max-width:768px){
.container{
padding:var(--spacing-md);
}

h1{
font-size:var(--font-size-3xl);
}
}
```

##ActualizacióndeEstilos

Sinecesitasactualizaroañadirnuevosestilos:

1.**Siempre**usavariablesCSSde`brand.css`
2.**Nunca**usescoloresdirectos(#codigo)
3.Verificaquesolousesnegro,blancoyamarillo
4.UsaMontserratconlospesoscorrectos
5.Pruebaendiferentestamañosdepantalla

##✅ChecklistdeVerificación

Antesdehacercommitdenuevosestilos:

-[]Solousonegro,blancoyamarillo
-[]UsovariablesCSS(--brand-*)
-[]UsoMontserratcomofuente
-[]Títulosconfont-weight:800
-[]Textonormalconfont-weight:500
-[]Singradientesmulticolor
-[]Sincoloresfueradelapaleta
-[]Probadoenmóvilydesktop
-[]Accesible(contrasteadecuado)

---

**Últimaactualización:**14deoctubrede2025
**Autor:**SistemadeDiseñoCEB
**Versión:**1.0.0

