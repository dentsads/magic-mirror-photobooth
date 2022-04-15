import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { fabric } from 'fabric';
import { of, Subject, Subscription } from 'rxjs';
import { map, switchMap, takeUntil, takeWhile, repeat, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import QRCode from 'qrcode';
import MicroModal from 'micromodal';

@Component({
  selector: 'app-accept-photo',
  templateUrl: './accept-photo.component.html',
  styleUrls: ['./accept-photo.component.css']
})
export class AcceptPhotoComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private allowNextTransitionButtonSubscription: Subscription;
  componentMetadata: any;
  componentData: any;
  allowNextTransitionButton: boolean = true;
  isFinalAcceptComponent: boolean;
  canvas: fabric.Canvas;
  document;
  
  scalePlusIcon: string = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRv
  cjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVy
  c2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIg
  eG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3
  dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDI5OS45
  OTggMjk5Ljk5OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk5Ljk5OCAyOTku
  OTk4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPGc+CiAgICAgIDxyZWN0IHg9
  IjAiIHk9IjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBzdHlsZT0iZmlsbDpyZ2IoMTAwJSwx
  MDAlLDEwMCUpO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lOyIvPgoJCQk8cGF0aCBkPSJNMTM5
  LjQxNCw5Ni4xOTNjLTIyLjY3MywwLTQxLjA1NiwxOC4zODktNDEuMDU2LDQxLjA2MmMwLDIyLjY3
  OCwxOC4zODMsNDEuMDYyLDQxLjA1Niw0MS4wNjIKCQkJCWMyMi42NzgsMCw0MS4wNTktMTguMzgz
  LDQxLjA1OS00MS4wNjJDMTgwLjQ3NCwxMTQuNTgyLDE2Mi4wOTQsOTYuMTkzLDEzOS40MTQsOTYu
  MTkzeiBNMTU5LjI1NSwxNDYuOTcxaC0xMi4wNnYxMi4wNgoJCQkJYzAsNC4yOTgtMy40ODMsNy43
  ODEtNy43ODEsNy43ODFjLTQuMjk4LDAtNy43ODEtMy40ODMtNy43ODEtNy43ODF2LTEyLjA2aC0x
  Mi4wNmMtNC4yOTgsMC03Ljc4MS0zLjQ4My03Ljc4MS03Ljc4MQoJCQkJYzAtNC4yOTgsMy40ODMt
  Ny43ODEsNy43ODEtNy43ODFoMTIuMDZ2LTEyLjA2M2MwLTQuMjk4LDMuNDgzLTcuNzgxLDcuNzgx
  LTcuNzgxYzQuMjk4LDAsNy43ODEsMy40ODMsNy43ODEsNy43ODF2MTIuMDYzaDEyLjA2CgkJCQlj
  NC4yOTgsMCw3Ljc4MSwzLjQ4Myw3Ljc4MSw3Ljc4MUMxNjcuMDM2LDE0My40ODgsMTYzLjU1NSwx
  NDYuOTcxLDE1OS4yNTUsMTQ2Ljk3MXoiLz4KCQkJPHBhdGggZD0iTTE0OS45OTcsMEM2Ny4xNTcs
  MCwwLjAwMSw2Ny4xNTgsMC4wMDEsMTQ5Ljk5NXM2Ny4xNTYsMTUwLjAwMywxNDkuOTk1LDE1MC4w
  MDNzMTUwLTY3LjE2MywxNTAtMTUwLjAwMwoJCQkJUzIzMi44MzYsMCwxNDkuOTk3LDB6IE0yMjUu
  NDM4LDIyMS4yNTRjLTIuMzcxLDIuMzc2LTUuNDgsMy41NjEtOC41OSwzLjU2MXMtNi4yMTctMS4x
  ODUtOC41OTMtMy41NjFsLTM0LjE0NS0zNC4xNDcKCQkJCWMtOS44MzcsNi44NjMtMjEuNzk0LDEw
  Ljg5Ni0zNC42OTcsMTAuODk2Yy0zMy41NDgsMC02MC43NDItMjcuMTk2LTYwLjc0Mi02MC43NDRj
  MC0zMy41NDgsMjcuMTk0LTYwLjc0Miw2MC43NDItNjAuNzQyCgkJCQljMzMuNTQ4LDAsNjAuNzQ0
  LDI3LjE5NCw2MC43NDQsNjAuNzM5YzAsMTEuODU1LTMuNDA4LDIyLjkwOS05LjI4LDMyLjI1Nmwz
  NC41NiwzNC41NjIKCQkJCUMyMzAuMTg1LDIwOC44MTcsMjMwLjE4NSwyMTYuNTEyLDIyNS40Mzgs
  MjIxLjI1NHoiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4K
  PGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+
  CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+
  Cgo=`;
  scalePlusImg;

  scaleMinusIcon: string = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0
  b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZl
  cnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8x
  IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8v
  d3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDI5
  OS45OTUgMjk5Ljk5NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk5Ljk5NSAy
  OTkuOTk1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8Zz4NCgkJPGc+DQo8cmVjdCB4
  PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgc3R5bGU9ImZpbGw6cmdiKDEwMCUs
  MTAwJSwxMDAlKTtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTsiLz4NCgkJCTxwYXRoIGQ9Ik0x
  MzkuNDE1LDk2LjE5NWMtMjIuNjczLDAtNDEuMDU2LDE4LjM4OS00MS4wNTYsNDEuMDYyYzAsMjIu
  Njc2LDE4LjM4Myw0MS4wNTksNDEuMDU2LDQxLjA1OQ0KCQkJCWM3LjQ0NiwwLDE0LjQxLTIuMDEs
  MjAuNDMtNS40NzhjMi42MjUtMS41MTEsNS4wNi0zLjMwOCw3LjI3NS01LjM0MmMwLjA4LTAuMDcz
  LDAuMTYzLTAuMTQ1LDAuMjQxLTAuMjE4DQoJCQkJYzAuNzA1LTAuNjU5LDEuMzkzLTEuMzQzLDIu
  MDUyLTIuMDQ5YzAuMDM2LTAuMDM5LDAuMDctMC4wNzgsMC4xMDYtMC4xMTdjMi43NTQtMi45Nzcs
  NS4wNzMtNi4zNjcsNi44Ni0xMC4wNjgNCgkJCQljMi41OTYtNS4zODcsNC4wOTUtMTEuNDA0LDQu
  MDk1LTE3Ljc4N0MxODAuNDc0LDExNC41ODQsMTYyLjA5Myw5Ni4xOTUsMTM5LjQxNSw5Ni4xOTV6
  IE0xNTkuMjU2LDE0Ni45NzNoLTM5LjY4NA0KCQkJCWMtNC4yOTgsMC03Ljc4MS0zLjQ4My03Ljc4
  MS03Ljc4MWMwLTQuMjk4LDMuNDgzLTcuNzgxLDcuNzgxLTcuNzgxaDM5LjY4NGM0LjI5OCwwLDcu
  NzgxLDMuNDgzLDcuNzgxLDcuNzgxDQoJCQkJQzE2Ny4wMzcsMTQzLjQ5LDE2My41NTQsMTQ2Ljk3
  MywxNTkuMjU2LDE0Ni45NzN6Ii8+DQoJCQk8cGF0aCBkPSJNMTQ5Ljk5NSwwQzY3LjE1NiwwLDAs
  NjcuMTU4LDAsMTQ5Ljk5NXM2Ny4xNTYsMTUwLDE0OS45OTUsMTUwczE1MC02Ny4xNjMsMTUwLTE1
  MFMyMzIuODM0LDAsMTQ5Ljk5NSwweg0KCQkJCSBNMjI1LjQzNywyMjEuMjU0Yy0yLjM3MSwyLjM3
  Ni01LjQ4LDMuNTYxLTguNTksMy41NjFjLTMuMTEsMC02LjIxNy0xLjE4NS04LjU5My0zLjU2MWwt
  MzQuMTQ1LTM0LjE0Nw0KCQkJCWMtOS44MzcsNi44NjMtMjEuNzkxLDEwLjg5Ni0zNC42OTcsMTAu
  ODk2Yy0zMy41NDgsMC02MC43NDItMjcuMTk2LTYwLjc0Mi02MC43NDRjMC0zMy41NDgsMjcuMTk0
  LTYwLjc0Miw2MC43NDItNjAuNzQyDQoJCQkJYzMzLjU0OCwwLDYwLjc0NCwyNy4xOTQsNjAuNzQ0
  LDYwLjc0MmMwLDExLjg1NS0zLjQwOCwyMi45MDktOS4yOCwzMi4yNTlsMzQuNTYsMzQuNTYNCgkJ
  CQlDMjMwLjE4MywyMDguODE3LDIzMC4xODMsMjE2LjUxMiwyMjUuNDM3LDIyMS4yNTR6Ii8+DQoJ
  CTwvZz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4N
  CjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8
  L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9n
  Pg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==`;
  scaleMinusImg;

  rotateClockwiseIcon: string = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxz
  dmcgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgIHhtbG5z
  OmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgICAgeG1sbnM6cmRmPSJodHRw
  Oi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIgogICAgIHhtbG5zOnN2Zz0i
  aHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3Jn
  LzIwMDAvc3ZnIgogICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5r
  IgogICAgIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2ZXJzaW9uPSIxLjEiPgogICAgPHRpdGxl
  PlJvdGF0ZSBSaWdodCBJY29uPC90aXRsZT4KICAgIDxkZXNjPlRoaXMgaXMgc2hhcGUgKHNvdXJj
  ZSkgZm9yIENsYXJpdHkgdmVjdG9yIGljb24gdGhlbWUgZm9yIGd0azwvZGVzYz4KICAgIDxtZXRh
  ZGF0YT4KICAgICAgICA8cmRmOlJERj4KICAgICAgICAgICAgPGNjOldvcmsgcmRmOmFib3V0PSIi
  PgogICAgICAgICAgICAgICAgPGRjOnRpdGxlPlJvdGF0ZSBSaWdodCBJY29uPC9kYzp0aXRsZT4K
  ICAgICAgICAgICAgICAgIDxkYzpkZXNjcmlwdGlvbj5UaGlzIGlzIHNoYXBlIChzb3VyY2UpIGZv
  ciBDbGFyaXR5IHZlY3RvciBpY29uIHRoZW1lIGZvciBndGs8L2RjOmRlc2NyaXB0aW9uPgogICAg
  ICAgICAgICAgICAgPGRjOmNyZWF0b3I+CiAgICAgICAgICAgICAgICAgICAgPGNjOkFnZW50Pgog
  ICAgICAgICAgICAgICAgICAgICAgICA8ZGM6dGl0bGU+SmFrdWIgSmFua2lld2ljejwvZGM6dGl0
  bGU+CiAgICAgICAgICAgICAgICAgICAgPC9jYzpBZ2VudD4KICAgICAgICAgICAgICAgIDwvZGM6
  Y3JlYXRvcj4KICAgICAgICAgICAgICAgIDxkYzpyaWdodHM+CiAgICAgICAgICAgICAgICAgICAg
  PGNjOkFnZW50PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGM6dGl0bGU+SmFrdWIgSmFua2ll
  d2ljejwvZGM6dGl0bGU+CiAgICAgICAgICAgICAgICAgICAgPC9jYzpBZ2VudD4KICAgICAgICAg
  ICAgICAgIDwvZGM6cmlnaHRzPgogICAgICAgICAgICAgICAgPGRjOmRhdGU+MjAxMDwvZGM6ZGF0
  ZT4KICAgICAgICAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0Pgog
  ICAgICAgICAgICAgICAgPGRjOnR5cGUgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMv
  ZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICAgICAgICAgIDxjYzpsaWNlbnNlIHJkZjpy
  ZXNvdXJjZT0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnktc2EvMy4wLyIg
  Lz4KICAgICAgICAgICAgIDwvY2M6V29yaz4KICAgICAgICA8L3JkZjpSREY+CiAgICA8L21ldGFk
  YXRhPgogICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIHN0eWxl
  PSJmaWxsOnJnYigxMDAlLDEwMCUsMTAwJSk7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7Ii8+
  CiAgICA8cGF0aCBkPSJtIDY0LDkuMzQzNzUgYyAzMC4xODU4MywwIDU0LjY1NjI1LDI0LjQ3MDQy
  IDU0LjY1NjI1LDU0LjY1NjI1IDAsMzAuMTg1ODI4IC0yNC40NzA0Miw1NC42NTYyNSAtNTQuNjU2
  MjUsNTQuNjU2MjUgQyAzMy44MTQxNywxMTguNjU2MjUgOS4zNDM3NSw5NC4xODU4MjggOS4zNDM3
  NSw2NCA5LjM0Mzc1LDMzLjgxNDE3IDMzLjgxNDE3LDkuMzQzNzUgNjQsOS4zNDM3NSB6IE0gNDAu
  MDkzNzUsMzIuMDYyNSBjIC0wLjc1MjM4MiwtMC4wMTc0NSAtMS40MDc2MTgsLTAuMDA1NyAtMS45
  Njg3NSwwIC0xLjMxMzYwNCwwLjAxMzM5IC0yLjA2MjUsMC4wNjI1IC0yLjA2MjUsMC4wNjI1IGwg
  MCwyMi43ODEyNSBjIDEyLjE2MjkxMiwwIDIxLjU2Njk4NSwwLjYyMTI1OSAyMi42NTYyNSwxNC4x
  MjUgbCAtMTguMzEyNSwwIDMwLjY4NzUsMzIuNDA2MjUgMzAuNzE4NzUsLTMyLjQwNjI1IC0xNy4y
  ODEyNSwwIEMgODIuNTU0MDA5LDM2LjA2NTU4MyA1MS4zNzk0NzksMzIuMzI0MjQ2IDQwLjA5Mzc1
  LDMyLjA2MjUgeiIvPgo8L3N2Zz4K`;
  rotateClockwiseImg;

  rotateCounterClockwiseIcon: string = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxz
  dmcgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgIHhtbG5z
  OmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgICAgeG1sbnM6cmRmPSJodHRw
  Oi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIgogICAgIHhtbG5zOnN2Zz0i
  aHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3Jn
  LzIwMDAvc3ZnIgogICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5r
  IgogICAgIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2ZXJzaW9uPSIxLjEiPgogICAgPHRpdGxl
  PlJvdGF0ZSBMZWZ0IEljb248L3RpdGxlPgogICAgPGRlc2M+VGhpcyBpcyBzaGFwZSAoc291cmNl
  KSBmb3IgQ2xhcml0eSB2ZWN0b3IgaWNvbiB0aGVtZSBmb3IgZ3RrPC9kZXNjPgogICAgPG1ldGFk
  YXRhPgogICAgICAgIDxyZGY6UkRGPgogICAgICAgICAgICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+
  CiAgICAgICAgICAgICAgICA8ZGM6dGl0bGU+Um90YXRlIExlZnQgSWNvbjwvZGM6dGl0bGU+CiAg
  ICAgICAgICAgICAgICA8ZGM6ZGVzY3JpcHRpb24+VGhpcyBpcyBzaGFwZSAoc291cmNlKSBmb3Ig
  Q2xhcml0eSB2ZWN0b3IgaWNvbiB0aGVtZSBmb3IgZ3RrPC9kYzpkZXNjcmlwdGlvbj4KICAgICAg
  ICAgICAgICAgIDxkYzpjcmVhdG9yPgogICAgICAgICAgICAgICAgICAgIDxjYzpBZ2VudD4KICAg
  ICAgICAgICAgICAgICAgICAgICAgPGRjOnRpdGxlPkpha3ViIEphbmtpZXdpY3o8L2RjOnRpdGxl
  PgogICAgICAgICAgICAgICAgICAgIDwvY2M6QWdlbnQ+CiAgICAgICAgICAgICAgICA8L2RjOmNy
  ZWF0b3I+CiAgICAgICAgICAgICAgICA8ZGM6cmlnaHRzPgogICAgICAgICAgICAgICAgICAgIDxj
  YzpBZ2VudD4KICAgICAgICAgICAgICAgICAgICAgICAgPGRjOnRpdGxlPkpha3ViIEphbmtpZXdp
  Y3o8L2RjOnRpdGxlPgogICAgICAgICAgICAgICAgICAgIDwvY2M6QWdlbnQ+CiAgICAgICAgICAg
  ICAgICA8L2RjOnJpZ2h0cz4KICAgICAgICAgICAgICAgIDxkYzpkYXRlPjIwMTA8L2RjOmRhdGU+
  CiAgICAgICAgICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAg
  ICAgICAgICAgICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2Rj
  bWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgICAgICAgICA8Y2M6bGljZW5zZSByZGY6cmVz
  b3VyY2U9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzMuMC8iIC8+
  CiAgICAgICAgICAgICA8L2NjOldvcms+CiAgICAgICAgPC9yZGY6UkRGPgogICAgPC9tZXRhZGF0
  YT4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBzdHlsZT0i
  ZmlsbDpyZ2IoMTAwJSwxMDAlLDEwMCUpO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lOyIvPgog
  ICAgPHBhdGggZD0iTSA2NCA5LjM0Mzc1IEMgMzMuODE0MTcgOS4zNDM3NSA5LjM0Mzc1IDMzLjgx
  NDE3IDkuMzQzNzUgNjQgQyA5LjM0Mzc1IDk0LjE4NTgyOCAzMy44MTQxNyAxMTguNjU2MjUgNjQg
  MTE4LjY1NjI1IEMgOTQuMTg1ODMgMTE4LjY1NjI1IDExOC42NTYyNSA5NC4xODU4MjggMTE4LjY1
  NjI1IDY0IEMgMTE4LjY1NjI1IDMzLjgxNDE3IDk0LjE4NTgzIDkuMzQzNzUgNjQgOS4zNDM3NSB6
  IE0gODcuOTA2MjUgMzIuMDYyNSBDIDg4LjY1ODYzMiAzMi4wNDUwNSA4OS4zMTM4NjggMzIuMDU2
  Nzc5IDg5Ljg3NSAzMi4wNjI1IEMgOTEuMTg4NjA0IDMyLjA3NTg5IDkxLjkzNzUgMzIuMTI1IDkx
  LjkzNzUgMzIuMTI1IEwgOTEuOTM3NSA1NC45MDYyNSBDIDc5Ljc3NDU4OCA1NC45MDYyNSA3MC4z
  NzA1MTUgNTUuNTI3NTA5IDY5LjI4MTI1IDY5LjAzMTI1IEwgODcuNTkzNzUgNjkuMDMxMjUgTCA1
  Ni45MDYyNSAxMDEuNDM3NSBMIDI2LjE4NzUgNjkuMDMxMjUgTCA0My40Njg3NSA2OS4wMzEyNSBD
  IDQ1LjQ0NTk5MSAzNi4wNjU1ODMgNzYuNjIwNTIxIDMyLjMyNDI0NiA4Ny45MDYyNSAzMi4wNjI1
  IHogIi8+Cjwvc3ZnPgo=`;
  rotateCounterClockwiseImg;

  image: any;

  readonly MAX_RETRY:number=60;
  readonly DELAY_IN_MS:number=100

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private routingService: RoutingService,
    private http: HttpClient,
    @Inject(DOCUMENT) document
  ) {

    this.document = document;

    this.scalePlusImg = document.createElement('img');
    this.scalePlusImg.src = this.scalePlusIcon;

    this.scaleMinusImg = document.createElement('img');
    this.scaleMinusImg.src = this.scaleMinusIcon;

    this.rotateClockwiseImg = document.createElement('img');
    this.rotateClockwiseImg.src = this.rotateClockwiseIcon;

    this.rotateCounterClockwiseImg = document.createElement('img');
    this.rotateCounterClockwiseImg.src = this.rotateCounterClockwiseIcon;
    
    let radiansToDegrees = function(radians) {
      let PiBy180 = Math.PI / 180;
      return radians / PiBy180;
    };

    let rotateObject = function rotateObject(rotateDirection: RotateDirection) {
      return function rotateObjectHandler(eventData, transform, x, y) {
        var t = transform,
            original = t.original,
            target = t.target,
            pivotPoint = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY);
    
        if (target.lockRotation) {
          return false;
        }

        var lastAngle = Math.atan2(t.ey - pivotPoint.y, t.ex - pivotPoint.x),
            curAngle =  Math.atan2(y - pivotPoint.y, x - pivotPoint.x),
            hasRotated = true;
        
        var rotationAngle = 0;

        if (rotateDirection == RotateDirection.CLOCKWISE) {
          rotationAngle = 45.0;
        } else if (rotateDirection == RotateDirection.COUNTERCLOCKWISE) {
          rotationAngle = -45.0;
        }

        //var angle = radiansToDegrees(curAngle - lastAngle + t.theta);
        var angle = original.angle + rotationAngle;
            
        if (target.snapAngle > 0) {
          var snapAngle  = target.snapAngle,
              snapThreshold  = target.snapThreshold || snapAngle,
              rightAngleLocked = Math.ceil(angle / snapAngle) * snapAngle,
              leftAngleLocked = Math.floor(angle / snapAngle) * snapAngle;
    
          if (Math.abs(angle - leftAngleLocked) < snapThreshold) {
            angle = leftAngleLocked;
          }
          else if (Math.abs(angle - rightAngleLocked) < snapThreshold) {
            angle = rightAngleLocked;
          }
        }
    
        // normalize angle to positive value
        if (angle < 0) {
          angle = 360 + angle;
        }
        angle %= 360;
    
        hasRotated = target.angle !== angle;
        target.angle = angle;

        var canvas = target.canvas;
        canvas.requestRenderAll();
  
        return hasRotated;
      }
    }


    let scaleObject = function scaleObject(scaleDirection: ScaleDirection) {
      return function scaleObjectHandler(eventData, transform, x, y, options) {
        options = options || {};
        var target = transform.target,
            lockScalingX = target.lockScalingX, lockScalingY = target.lockScalingY,
            by = options.by, scaleX, scaleY, dim;
  
        dim = target._getTransformedDimensions();      
  
        if (scaleDirection != ScaleDirection.UP && (dim.x <= 75 || dim.y <= 75)) {
          lockScalingX = true;
          lockScalingY = true;
        }

        if (scaleDirection == ScaleDirection.UP && (dim.x >= 150 || dim.y >= 150)) {
          lockScalingX = true;
          lockScalingY = true;
        }
  
        var original = transform.original, hasScaled, scale;

        if (scaleDirection == ScaleDirection.UP) {
          scale = 1.4;
        } else {
          scale = 0.7;
        }        

        scaleX = original.scaleX * scale;
        scaleY = original.scaleY * scale;
  
        !lockScalingX && target.set('scaleX', scaleX);
        !lockScalingY && target.set('scaleY', scaleY);
  
        var oldScaleX = target.scaleX, oldScaleY = target.scaleY;
        hasScaled = oldScaleX !== target.scaleX || oldScaleY !== target.scaleY;
  
        var canvas = target.canvas;
        canvas.requestRenderAll();
  
        return hasScaled;
      }
    }          

    fabric.Object.prototype.controls.scaleControlPlus = new fabric.Control({
      x: -0.5,
      y: 0.5,
      offsetX: -40,
      offsetY: 40,      
      cursorStyle: 'pointer',
      mouseUpHandler: scaleObject(ScaleDirection.UP),
      render: this.renderIcon(this.scalePlusImg),
      cornerSize: 80,
      sizeX: 70,
      sizeY: 70
    });

    fabric.Object.prototype.controls.scaleControlMinus = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: 40,
      offsetY: 40,      
      cursorStyle: 'pointer',
      mouseUpHandler: scaleObject(ScaleDirection.DOWN),
      render: this.renderIcon(this.scaleMinusImg),
      cornerSize: 80,
      sizeX: 70,
      sizeY: 70
    });
  
    fabric.Object.prototype.controls.rotateCounterClockwise = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -40,
      offsetY: -40,      
      cursorStyle: 'pointer',
      mouseUpHandler: rotateObject(RotateDirection.COUNTERCLOCKWISE),
      render: this.renderIcon(this.rotateCounterClockwiseImg),
      withConnection: true,
      cornerSize: 80,
      sizeX: 70,
      sizeY: 70
    });

    fabric.Object.prototype.controls.rotateClockwiseControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 40,
      offsetY: -40,      
      cursorStyle: 'pointer',
      mouseUpHandler: rotateObject(RotateDirection.CLOCKWISE),
      render: this.renderIcon(this.rotateClockwiseImg),
      withConnection: true,
      cornerSize: 80,
      sizeX: 70,
      sizeY: 70
    });

  }  
  

  async ngOnInit() {
    this.subscription = this.activatedRoute.paramMap.subscribe(async params => {
      this.componentMetadata = await this.routingService.getComponentMetadata();
      this.componentData = this.componentMetadata.assets;      
      this.isFinalAcceptComponent = this.componentMetadata.isFinalAcceptComponent;
     
      if (this.componentData.context) {

        this.getPresignedUrl(this.componentData.context.photoPath)        
        
        this.canvas = new fabric.Canvas('canvas-image');
        
        fabric.Object.prototype.setControlVisible('tl', false);
        fabric.Object.prototype.setControlVisible('tr', false);
        fabric.Object.prototype.setControlVisible('br', false);
        fabric.Object.prototype.setControlVisible('bl', false);
        fabric.Object.prototype.setControlVisible('ml', false);
        fabric.Object.prototype.setControlVisible('mt', false);
        fabric.Object.prototype.setControlVisible('mr', false);
        fabric.Object.prototype.setControlVisible('mb', false);
        fabric.Object.prototype.setControlVisible('mtr', false);
        fabric.Object.prototype.hasBorders = false;
        fabric.Object.prototype.cornerSize = 40;

        //http://localhost:4200/api/photos/default/0uy71b_random.jpg
        //fabric.Image.fromURL(this.componentData.context.photoPath, (img) => {

        this.image = new Image();
        this.image.addEventListener( 'load', () => {
          fabric.Image.fromURL(this.componentData.context.photoPath, (img, err) => {
            
            if (img.width > 800)
              img = img.scaleToWidth(800);
            
            this.canvas.setHeight(img.height*img.scaleY);
            this.canvas.setWidth(img.width*img.scaleX);
      
            this.canvas.setBackgroundImage(img, () => {
              this.canvas.requestRenderAll();              
              this.handleImage();
            });
          }); 
        }, false );
        this.image.src = this.componentData.context.photoPath;
        
      } else {
        console.log("context still not loaded")
      }            

    });

    MicroModal.init({
      onShow: modal => console.info(`${modal.id} is shown`), // [1]
      onClose: modal => console.info(`${modal.id} is hidden`), // [2]
      openClass: 'is-open', // [5]
      disableScroll: true, // [6]
      disableFocus: false, // [7]
      awaitOpenAnimation: false, // [8]
      awaitCloseAnimation: false, // [9]
      debugMode: false // [10]
    });
    
    this.allowNextTransitionButtonSubscription =  this.routingService.allowNextTransitionButton.subscribe((value: boolean) => { 
      this.allowNextTransitionButton = value; 
    });

    this.handleEvent("event.loading-finished.01");
    
  }

  async ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.allowNextTransitionButtonSubscription) {
      this.allowNextTransitionButtonSubscription.unsubscribe();
    }
  }

  async handleEvent(eventId: string) {
    if (this.isFinalAcceptComponent != undefined &&  !this.isFinalAcceptComponent) {
      var dataURL = this.canvas.toDataURL( { format: "jpeg", quality: 1 } );
      this.routingService.handleEvent(eventId, { imageDataURL: this.canvas.isEmpty() ? "": dataURL });
    } else {
      this.routingService.handleEvent(eventId);
    }    
  }

  sleep(ms): Promise<any> {
    return new Promise((resolve): any => setTimeout(resolve, ms))
  }
  
  async wait(ms): Promise<any> {
    await this.sleep(ms)
  }

  getPresignedUrl(photoPath: string) {
    const stopper = new Subject();
    
    of({})
    .pipe(
        switchMap(() => this.http.get('/api/presigned_url')),
        map( (response: any) => {            
            if (response.file && response.presigned_url && ( !photoPath.includes(response.file) || response.file_uploaded == "false" )) {    
              return undefined;              
            } else {
              return response;
            }
        }),
        delay(this.DELAY_IN_MS),
        repeat(this.MAX_RETRY),
        takeUntil(stopper)
    )
    .subscribe(response => {
      if (!response) {
        return
      }

      let canvas = this.document.getElementById('canvas-qr');

      QRCode.toCanvas(canvas, response.presigned_url, {
        color: {
          dark: '#FFFFFF',  // white dots
          light: '#000000' // black background
        },
        margin: 1,
        scale: 3        
      }, (error) => {
        if (error) 
          console.error(error)
        
        console.log('QR code successfully generated.');
        
        this.handleCanvas();
      })

      stopper.next();
    });
  }

  renderIcon(icon) {
    return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      var size = this.cornerSize;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(icon, -size/2, -size/2, size, size);
      ctx.restore();
    }
  }

  handleClearCanvas() {
    // remove all objects but leave background image alone
    this.canvas.remove(...this.canvas.getObjects());
  }

  handleCanvas() {
    // fade in canvas
    this.document.getElementById('canvas-qr-div').style.opacity = '1';     
  }

  handleImage() {
    // fade in image
    this.document.getElementById('overlay-outer').style.opacity = '1';    
  }

  handleOpenEmojiModal() {
    MicroModal.show('modal-1');  
  }

  handleCloseEmojiModal() {
    MicroModal.close('modal-1');  
  }

  handleEmoji(emojiCode: string) {
    //this.canvas.add(new fabric.Text(String.fromCodePoint(0x1F354), { top: 200, left: 200 }))
    let emoji = new fabric.Text(emojiCode, { fontSize: 80, originY: "center", originX: "center"});
    this.canvas.add(emoji);
    this.canvas.setActiveObject(emoji);
    emoji.center();
    emoji.setCoords();    
    this.document.getElementById('emoji-placeholder').innerHTML = emojiCode;
    MicroModal.close('modal-1');
  }

}

enum ScaleDirection {
  UP = 1,
  DOWN
}

enum RotateDirection {
  CLOCKWISE = 1,
  COUNTERCLOCKWISE,
}