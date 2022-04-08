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
  rotateIcon: string = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='487.23px' height='487.23px' viewBox='0 0 487.23 487.23' style='background-color: %23ffffff; enable-background:new 0 0 487.23 487.23;' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cpath d='M55.323,203.641c15.664,0,29.813-9.405,35.872-23.854c25.017-59.604,83.842-101.61,152.42-101.61 c37.797,0,72.449,12.955,100.23,34.442l-21.775,3.371c-7.438,1.153-13.224,7.054-14.232,14.512 c-1.01,7.454,3.008,14.686,9.867,17.768l119.746,53.872c5.249,2.357,11.33,1.904,16.168-1.205 c4.83-3.114,7.764-8.458,7.796-14.208l0.621-131.943c0.042-7.506-4.851-14.144-12.024-16.332 c-7.185-2.188-14.947,0.589-19.104,6.837l-16.505,24.805C370.398,26.778,310.1,0,243.615,0C142.806,0,56.133,61.562,19.167,149.06 c-5.134,12.128-3.84,26.015,3.429,36.987C29.865,197.023,42.152,203.641,55.323,203.641z'/%3E%3Cpath d='M464.635,301.184c-7.27-10.977-19.558-17.594-32.728-17.594c-15.664,0-29.813,9.405-35.872,23.854 c-25.018,59.604-83.843,101.61-152.42,101.61c-37.798,0-72.45-12.955-100.232-34.442l21.776-3.369 c7.437-1.153,13.223-7.055,14.233-14.514c1.009-7.453-3.008-14.686-9.867-17.768L49.779,285.089 c-5.25-2.356-11.33-1.905-16.169,1.205c-4.829,3.114-7.764,8.458-7.795,14.207l-0.622,131.943 c-0.042,7.506,4.85,14.144,12.024,16.332c7.185,2.188,14.948-0.59,19.104-6.839l16.505-24.805 c44.004,43.32,104.303,70.098,170.788,70.098c100.811,0,187.481-61.561,224.446-149.059 C473.197,326.043,471.903,312.157,464.635,301.184z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3C/svg%3E%0A"
  scaleIcon: string = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3C!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 357.18 357.18' style='background-color: %23ffffff; enable-background:new 0 0 357.18 357.18;' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cpath d='M123.292,96.7c-0.128-0.196-0.112-0.408-0.284-0.58L65.456,38.564l31.268,0.048c7.396,0,13.82-6.42,13.816-13.812 l0.004-10.524c0-7.648-6.22-13.868-13.864-13.868H15.04C11.264,0.408,7.7,2,5.072,4.68c-2.608,2.596-4.164,6.088-4.164,9.86V97.9 c-0.004,7.64,6.216,13.86,13.86,13.86l10.528,0.008c7.636,0,13.848-6.212,13.852-13.852l-0.02-31.32L89,116.472 c0.028,0.024,0.052,0.048,0.072,0.072l6.428,6.42c5.404,5.408,14.104,5.284,19.512-0.124l7.44-7.436 C127.576,110.272,127.884,102.144,123.292,96.7z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M357.132,260.884c0-7.648-6.212-13.876-13.856-13.876L332.756,247c-7.384-0.008-13.836,6.444-13.836,13.836l0.048,31.272 L261.64,234.78c-0.18-0.18-0.5-0.268-0.696-0.4c-5.444-4.6-13.688-4.396-18.812,0.728l-7.444,7.444 c-5.4,5.4-5.316,14.32,0.1,19.736l6.42,6.42c0.024,0.024,0.048,0.048,0.072,0.072l49.656,49.656l-31.312-0.016 c-7.384,0-13.852,6.46-13.852,13.852l0.024,10.544c-0.008,7.64,6.228,13.876,13.868,13.868l83.38,0.032 c3.688-0.008,7.196-1.4,9.824-4.032l0.376-0.376c2.532-2.54,3.936-6.048,3.936-9.728L357.132,260.884z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M122.308,242.804l-7.448-7.452c-5.12-5.116-13.412-5.24-18.852-0.648c-0.196,0.132-0.56,0.296-0.736,0.468l-57.084,57.084 l0.036-31.288c0.004-3.684-1.42-7.14-4.04-9.764c-2.624-2.62-6.104-4.072-9.792-4.064l-10.524-0.008 c-3.824,0-7.288,1.556-9.8,4.072C1.552,253.712,0,257.18,0,261v81.64c0,3.78,1.52,7.32,4.272,9.968 c2.544,2.648,6.084,4.164,9.86,4.164h83.36c7.644,0.008,13.864-6.212,13.864-13.852v-10.532c0-3.688-1.436-7.156-4.064-9.78 c-2.62-2.628-6.084-4.056-9.772-4.056l-31.296,0.024l49.412-49.404c0.024-0.024,0.044-0.04,0.064-0.064l5.584-5.584l0.84-0.844 C127.532,257.272,127.708,248.204,122.308,242.804z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M356.348,14.576c0-3.772-1.516-7.312-4.264-9.964c-2.556-2.648-6.096-4.172-9.868-4.172h-81.64 c-3.82,0-7.288,1.556-9.796,4.064c-2.516,2.516-4.072,5.976-4.072,9.796v10.524c0,3.696,1.44,7.164,4.064,9.788 c2.616,2.62,6.084,4.056,9.772,4.056l31.288-0.04l-57.4,57.4c-0.172,0.18-0.312,0.516-0.444,0.712 c-4.592,5.444-4.436,13.704,0.68,18.82l7.452,7.452c5.4,5.4,14.412,5.276,19.82-0.132l6.42-6.42 c0.032-0.024,0.048-0.048,0.072-0.072l49.728-49.724l-0.032,31.296c0,3.692,1.416,7.14,4.04,9.756 c2.624,2.636,6.108,4.08,9.788,4.072l10.532,0.008c7.648,0,13.864-6.22,13.864-13.868L356.348,14.576z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Cpath d='M205.732,151.704c-15.004-14.992-39.396-14.992-54.392,0c-14.996,14.992-14.996,39.392,0.004,54.392 c14.992,14.992,39.392,14.992,54.388,0C220.724,191.104,220.724,166.696,205.732,151.704z'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3Cg%3E%3C/g%3E%3C/svg%3E%0A"
  scaleImg;
  rotateImg;

  scalePlusIcon: string = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDI5OS45OTggMjk5Ljk5OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk5Ljk5OCAyOTkuOTk4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBkPSJNMTM5LjQxNCw5Ni4xOTNjLTIyLjY3MywwLTQxLjA1NiwxOC4zODktNDEuMDU2LDQxLjA2MmMwLDIyLjY3OCwxOC4zODMsNDEuMDYyLDQxLjA1Niw0MS4wNjINCgkJCQljMjIuNjc4LDAsNDEuMDU5LTE4LjM4Myw0MS4wNTktNDEuMDYyQzE4MC40NzQsMTE0LjU4MiwxNjIuMDk0LDk2LjE5MywxMzkuNDE0LDk2LjE5M3ogTTE1OS4yNTUsMTQ2Ljk3MWgtMTIuMDZ2MTIuMDYNCgkJCQljMCw0LjI5OC0zLjQ4Myw3Ljc4MS03Ljc4MSw3Ljc4MWMtNC4yOTgsMC03Ljc4MS0zLjQ4My03Ljc4MS03Ljc4MXYtMTIuMDZoLTEyLjA2Yy00LjI5OCwwLTcuNzgxLTMuNDgzLTcuNzgxLTcuNzgxDQoJCQkJYzAtNC4yOTgsMy40ODMtNy43ODEsNy43ODEtNy43ODFoMTIuMDZ2LTEyLjA2M2MwLTQuMjk4LDMuNDgzLTcuNzgxLDcuNzgxLTcuNzgxYzQuMjk4LDAsNy43ODEsMy40ODMsNy43ODEsNy43ODF2MTIuMDYzaDEyLjA2DQoJCQkJYzQuMjk4LDAsNy43ODEsMy40ODMsNy43ODEsNy43ODFDMTY3LjAzNiwxNDMuNDg4LDE2My41NTUsMTQ2Ljk3MSwxNTkuMjU1LDE0Ni45NzF6Ii8+DQoJCQk8cGF0aCBkPSJNMTQ5Ljk5NywwQzY3LjE1NywwLDAuMDAxLDY3LjE1OCwwLjAwMSwxNDkuOTk1czY3LjE1NiwxNTAuMDAzLDE0OS45OTUsMTUwLjAwM3MxNTAtNjcuMTYzLDE1MC0xNTAuMDAzDQoJCQkJUzIzMi44MzYsMCwxNDkuOTk3LDB6IE0yMjUuNDM4LDIyMS4yNTRjLTIuMzcxLDIuMzc2LTUuNDgsMy41NjEtOC41OSwzLjU2MXMtNi4yMTctMS4xODUtOC41OTMtMy41NjFsLTM0LjE0NS0zNC4xNDcNCgkJCQljLTkuODM3LDYuODYzLTIxLjc5NCwxMC44OTYtMzQuNjk3LDEwLjg5NmMtMzMuNTQ4LDAtNjAuNzQyLTI3LjE5Ni02MC43NDItNjAuNzQ0YzAtMzMuNTQ4LDI3LjE5NC02MC43NDIsNjAuNzQyLTYwLjc0Mg0KCQkJCWMzMy41NDgsMCw2MC43NDQsMjcuMTk0LDYwLjc0NCw2MC43MzljMCwxMS44NTUtMy40MDgsMjIuOTA5LTkuMjgsMzIuMjU2bDM0LjU2LDM0LjU2Mg0KCQkJCUMyMzAuMTg1LDIwOC44MTcsMjMwLjE4NSwyMTYuNTEyLDIyNS40MzgsMjIxLjI1NHoiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K"
  scalePlusImg;

  scaleMinusIcon: string = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDI5OS45OTUgMjk5Ljk5NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk5Ljk5NSAyOTkuOTk1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Zz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBkPSJNMTM5LjQxNSw5Ni4xOTVjLTIyLjY3MywwLTQxLjA1NiwxOC4zODktNDEuMDU2LDQxLjA2MmMwLDIyLjY3NiwxOC4zODMsNDEuMDU5LDQxLjA1Niw0MS4wNTkNCgkJCQljNy40NDYsMCwxNC40MS0yLjAxLDIwLjQzLTUuNDc4YzIuNjI1LTEuNTExLDUuMDYtMy4zMDgsNy4yNzUtNS4zNDJjMC4wOC0wLjA3MywwLjE2My0wLjE0NSwwLjI0MS0wLjIxOA0KCQkJCWMwLjcwNS0wLjY1OSwxLjM5My0xLjM0MywyLjA1Mi0yLjA0OWMwLjAzNi0wLjAzOSwwLjA3LTAuMDc4LDAuMTA2LTAuMTE3YzIuNzU0LTIuOTc3LDUuMDczLTYuMzY3LDYuODYtMTAuMDY4DQoJCQkJYzIuNTk2LTUuMzg3LDQuMDk1LTExLjQwNCw0LjA5NS0xNy43ODdDMTgwLjQ3NCwxMTQuNTg0LDE2Mi4wOTMsOTYuMTk1LDEzOS40MTUsOTYuMTk1eiBNMTU5LjI1NiwxNDYuOTczaC0zOS42ODQNCgkJCQljLTQuMjk4LDAtNy43ODEtMy40ODMtNy43ODEtNy43ODFjMC00LjI5OCwzLjQ4My03Ljc4MSw3Ljc4MS03Ljc4MWgzOS42ODRjNC4yOTgsMCw3Ljc4MSwzLjQ4Myw3Ljc4MSw3Ljc4MQ0KCQkJCUMxNjcuMDM3LDE0My40OSwxNjMuNTU0LDE0Ni45NzMsMTU5LjI1NiwxNDYuOTczeiIvPg0KCQkJPHBhdGggZD0iTTE0OS45OTUsMEM2Ny4xNTYsMCwwLDY3LjE1OCwwLDE0OS45OTVzNjcuMTU2LDE1MCwxNDkuOTk1LDE1MHMxNTAtNjcuMTYzLDE1MC0xNTBTMjMyLjgzNCwwLDE0OS45OTUsMHoNCgkJCQkgTTIyNS40MzcsMjIxLjI1NGMtMi4zNzEsMi4zNzYtNS40OCwzLjU2MS04LjU5LDMuNTYxYy0zLjExLDAtNi4yMTctMS4xODUtOC41OTMtMy41NjFsLTM0LjE0NS0zNC4xNDcNCgkJCQljLTkuODM3LDYuODYzLTIxLjc5MSwxMC44OTYtMzQuNjk3LDEwLjg5NmMtMzMuNTQ4LDAtNjAuNzQyLTI3LjE5Ni02MC43NDItNjAuNzQ0YzAtMzMuNTQ4LDI3LjE5NC02MC43NDIsNjAuNzQyLTYwLjc0Mg0KCQkJCWMzMy41NDgsMCw2MC43NDQsMjcuMTk0LDYwLjc0NCw2MC43NDJjMCwxMS44NTUtMy40MDgsMjIuOTA5LTkuMjgsMzIuMjU5bDM0LjU2LDM0LjU2DQoJCQkJQzIzMC4xODMsMjA4LjgxNywyMzAuMTgzLDIxNi41MTIsMjI1LjQzNywyMjEuMjU0eiIvPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo="
  scaleMinusImg;

  rotateClockwiseIcon: string = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIgogICAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICAgIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2ZXJzaW9uPSIxLjEiPgogICAgPHRpdGxlPlJvdGF0ZSBSaWdodCBJY29uPC90aXRsZT4KICAgIDxkZXNjPlRoaXMgaXMgc2hhcGUgKHNvdXJjZSkgZm9yIENsYXJpdHkgdmVjdG9yIGljb24gdGhlbWUgZm9yIGd0azwvZGVzYz4KICAgIDxtZXRhZGF0YT4KICAgICAgICA8cmRmOlJERj4KICAgICAgICAgICAgPGNjOldvcmsgcmRmOmFib3V0PSIiPgogICAgICAgICAgICAgICAgPGRjOnRpdGxlPlJvdGF0ZSBSaWdodCBJY29uPC9kYzp0aXRsZT4KICAgICAgICAgICAgICAgIDxkYzpkZXNjcmlwdGlvbj5UaGlzIGlzIHNoYXBlIChzb3VyY2UpIGZvciBDbGFyaXR5IHZlY3RvciBpY29uIHRoZW1lIGZvciBndGs8L2RjOmRlc2NyaXB0aW9uPgogICAgICAgICAgICAgICAgPGRjOmNyZWF0b3I+CiAgICAgICAgICAgICAgICAgICAgPGNjOkFnZW50PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGM6dGl0bGU+SmFrdWIgSmFua2lld2ljejwvZGM6dGl0bGU+CiAgICAgICAgICAgICAgICAgICAgPC9jYzpBZ2VudD4KICAgICAgICAgICAgICAgIDwvZGM6Y3JlYXRvcj4KICAgICAgICAgICAgICAgIDxkYzpyaWdodHM+CiAgICAgICAgICAgICAgICAgICAgPGNjOkFnZW50PgogICAgICAgICAgICAgICAgICAgICAgICA8ZGM6dGl0bGU+SmFrdWIgSmFua2lld2ljejwvZGM6dGl0bGU+CiAgICAgICAgICAgICAgICAgICAgPC9jYzpBZ2VudD4KICAgICAgICAgICAgICAgIDwvZGM6cmlnaHRzPgogICAgICAgICAgICAgICAgPGRjOmRhdGU+MjAxMDwvZGM6ZGF0ZT4KICAgICAgICAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgICAgICAgICAgPGRjOnR5cGUgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICAgICAgICAgIDxjYzpsaWNlbnNlIHJkZjpyZXNvdXJjZT0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnktc2EvMy4wLyIgLz4KICAgICAgICAgICAgIDwvY2M6V29yaz4KICAgICAgICA8L3JkZjpSREY+CiAgICA8L21ldGFkYXRhPgogICAgPHBhdGggZD0ibSA2NCw5LjM0Mzc1IGMgMzAuMTg1ODMsMCA1NC42NTYyNSwyNC40NzA0MiA1NC42NTYyNSw1NC42NTYyNSAwLDMwLjE4NTgyOCAtMjQuNDcwNDIsNTQuNjU2MjUgLTU0LjY1NjI1LDU0LjY1NjI1IEMgMzMuODE0MTcsMTE4LjY1NjI1IDkuMzQzNzUsOTQuMTg1ODI4IDkuMzQzNzUsNjQgOS4zNDM3NSwzMy44MTQxNyAzMy44MTQxNyw5LjM0Mzc1IDY0LDkuMzQzNzUgeiBNIDQwLjA5Mzc1LDMyLjA2MjUgYyAtMC43NTIzODIsLTAuMDE3NDUgLTEuNDA3NjE4LC0wLjAwNTcgLTEuOTY4NzUsMCAtMS4zMTM2MDQsMC4wMTMzOSAtMi4wNjI1LDAuMDYyNSAtMi4wNjI1LDAuMDYyNSBsIDAsMjIuNzgxMjUgYyAxMi4xNjI5MTIsMCAyMS41NjY5ODUsMC42MjEyNTkgMjIuNjU2MjUsMTQuMTI1IGwgLTE4LjMxMjUsMCAzMC42ODc1LDMyLjQwNjI1IDMwLjcxODc1LC0zMi40MDYyNSAtMTcuMjgxMjUsMCBDIDgyLjU1NDAwOSwzNi4wNjU1ODMgNTEuMzc5NDc5LDMyLjMyNDI0NiA0MC4wOTM3NSwzMi4wNjI1IHoiLz4KPC9zdmc+"
  rotateClockwiseImg;

  rotateCounterClockwiseIcon: string = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIgogICAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICAgIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIgogICAgIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiB2ZXJzaW9uPSIxLjEiPgogICAgPHRpdGxlPlJvdGF0ZSBMZWZ0IEljb248L3RpdGxlPgogICAgPGRlc2M+VGhpcyBpcyBzaGFwZSAoc291cmNlKSBmb3IgQ2xhcml0eSB2ZWN0b3IgaWNvbiB0aGVtZSBmb3IgZ3RrPC9kZXNjPgogICAgPG1ldGFkYXRhPgogICAgICAgIDxyZGY6UkRGPgogICAgICAgICAgICA8Y2M6V29yayByZGY6YWJvdXQ9IiI+CiAgICAgICAgICAgICAgICA8ZGM6dGl0bGU+Um90YXRlIExlZnQgSWNvbjwvZGM6dGl0bGU+CiAgICAgICAgICAgICAgICA8ZGM6ZGVzY3JpcHRpb24+VGhpcyBpcyBzaGFwZSAoc291cmNlKSBmb3IgQ2xhcml0eSB2ZWN0b3IgaWNvbiB0aGVtZSBmb3IgZ3RrPC9kYzpkZXNjcmlwdGlvbj4KICAgICAgICAgICAgICAgIDxkYzpjcmVhdG9yPgogICAgICAgICAgICAgICAgICAgIDxjYzpBZ2VudD4KICAgICAgICAgICAgICAgICAgICAgICAgPGRjOnRpdGxlPkpha3ViIEphbmtpZXdpY3o8L2RjOnRpdGxlPgogICAgICAgICAgICAgICAgICAgIDwvY2M6QWdlbnQ+CiAgICAgICAgICAgICAgICA8L2RjOmNyZWF0b3I+CiAgICAgICAgICAgICAgICA8ZGM6cmlnaHRzPgogICAgICAgICAgICAgICAgICAgIDxjYzpBZ2VudD4KICAgICAgICAgICAgICAgICAgICAgICAgPGRjOnRpdGxlPkpha3ViIEphbmtpZXdpY3o8L2RjOnRpdGxlPgogICAgICAgICAgICAgICAgICAgIDwvY2M6QWdlbnQ+CiAgICAgICAgICAgICAgICA8L2RjOnJpZ2h0cz4KICAgICAgICAgICAgICAgIDxkYzpkYXRlPjIwMTA8L2RjOmRhdGU+CiAgICAgICAgICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICAgICAgICAgIDxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgICAgICAgICA8Y2M6bGljZW5zZSByZGY6cmVzb3VyY2U9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzMuMC8iIC8+CiAgICAgICAgICAgICA8L2NjOldvcms+CiAgICAgICAgPC9yZGY6UkRGPgogICAgPC9tZXRhZGF0YT4KICAgIDxwYXRoIGQ9Ik0gNjQgOS4zNDM3NSBDIDMzLjgxNDE3IDkuMzQzNzUgOS4zNDM3NSAzMy44MTQxNyA5LjM0Mzc1IDY0IEMgOS4zNDM3NSA5NC4xODU4MjggMzMuODE0MTcgMTE4LjY1NjI1IDY0IDExOC42NTYyNSBDIDk0LjE4NTgzIDExOC42NTYyNSAxMTguNjU2MjUgOTQuMTg1ODI4IDExOC42NTYyNSA2NCBDIDExOC42NTYyNSAzMy44MTQxNyA5NC4xODU4MyA5LjM0Mzc1IDY0IDkuMzQzNzUgeiBNIDg3LjkwNjI1IDMyLjA2MjUgQyA4OC42NTg2MzIgMzIuMDQ1MDUgODkuMzEzODY4IDMyLjA1Njc3OSA4OS44NzUgMzIuMDYyNSBDIDkxLjE4ODYwNCAzMi4wNzU4OSA5MS45Mzc1IDMyLjEyNSA5MS45Mzc1IDMyLjEyNSBMIDkxLjkzNzUgNTQuOTA2MjUgQyA3OS43NzQ1ODggNTQuOTA2MjUgNzAuMzcwNTE1IDU1LjUyNzUwOSA2OS4yODEyNSA2OS4wMzEyNSBMIDg3LjU5Mzc1IDY5LjAzMTI1IEwgNTYuOTA2MjUgMTAxLjQzNzUgTCAyNi4xODc1IDY5LjAzMTI1IEwgNDMuNDY4NzUgNjkuMDMxMjUgQyA0NS40NDU5OTEgMzYuMDY1NTgzIDc2LjYyMDUyMSAzMi4zMjQyNDYgODcuOTA2MjUgMzIuMDYyNSB6ICIvPgo8L3N2Zz4="
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

    this.scaleImg = document.createElement('img');
    this.scaleImg.src = this.scaleIcon;

    this.rotateImg = document.createElement('img');
    this.rotateImg.src = this.rotateIcon;

    this.scalePlusImg = document.createElement('img');
    this.scalePlusImg.src = this.scalePlusIcon;

    this.scaleMinusImg = document.createElement('img');
    this.scaleMinusImg.src = this.scaleMinusIcon;

    this.rotateClockwiseImg = document.createElement('img');
    this.rotateClockwiseImg.src = this.rotateClockwiseIcon;
    
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

        console.log(t);
        console.log("x: " + x);
        console.log("y: " + y);
        console.log("lastAngle: " + lastAngle);
        console.log("curAngle: " + curAngle);
        console.log("angle: " + angle);
        console.log("t.theta: " + t.theta);
        console.log("lastAngle degree: " + radiansToDegrees(lastAngle));
            
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
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: scaleObject(ScaleDirection.UP),
      render: this.renderIcon(this.scalePlusImg),
      cornerSize: 80
    });

    fabric.Object.prototype.controls.scaleControlMinus = new fabric.Control({
      x: -0.5,
      y: 0.5,
      offsetY: 16,
      offsetX: -16,
      cursorStyle: 'pointer',
      mouseUpHandler: scaleObject(ScaleDirection.DOWN),
      render: this.renderIcon(this.scaleMinusImg),
      cornerSize: 80
    });
  
    fabric.Object.prototype.controls.rotateControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: -16,
      cursorStyle: 'pointer',
      mouseUpHandler: rotateObject(RotateDirection.COUNTERCLOCKWISE),
      render: this.renderIcon(this.rotateImg),
      withConnection: true,
      cornerSize: 80
    });

    fabric.Object.prototype.controls.rotateClockwiseControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetY: 16,
      offsetX: 16,
      cursorStyle: 'pointer',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      render: this.renderIcon(this.rotateClockwiseImg),
      withConnection: true,
      cornerSize: 80
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