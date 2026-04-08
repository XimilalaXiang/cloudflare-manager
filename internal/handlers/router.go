package handlers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/ximilala/cloudflare-manager/internal/middleware"
	"github.com/ximilala/cloudflare-manager/internal/services"
)

func SetupRouter(
	accountService *services.AccountService,
	workerService *services.WorkerService,
	zoneService *services.ZoneService,
	routeService *services.RouteService,
	kvService *services.KVService,
	d1Service *services.D1Service,
	r2Service *services.R2Service,
	pagesService *services.PagesService,
) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORS())

	authHandler := NewAuthHandler()
	accountHandler := NewAccountHandler(accountService)
	workerHandler := NewWorkerHandler(workerService)
	zoneHandler := NewZoneHandler(zoneService)
	routeHandler := NewRouteHandler(routeService)
	kvHandler := NewKVHandler(kvService)
	d1Handler := NewD1Handler(d1Service)
	r2Handler := NewR2Handler(r2Service)
	pagesHandler := NewPagesHandler(pagesService)

	api := r.Group("/api")
	{
		api.POST("/auth/login", authHandler.Login)

		auth := api.Group("")
		auth.Use(middleware.AuthRequired())
		{
			auth.GET("/auth/me", authHandler.Me)
			auth.POST("/auth/change-password", authHandler.ChangePassword)

			accounts := auth.Group("/accounts")
			{
				accounts.GET("", accountHandler.List)
				accounts.POST("", accountHandler.Create)
				accounts.GET("/:id", accountHandler.Get)
				accounts.PUT("/:id", accountHandler.Update)
				accounts.DELETE("/:id", accountHandler.Delete)
				accounts.POST("/:id/verify", accountHandler.Verify)
			}

			cf := auth.Group("/cf/:accountId")
			{
			workers := cf.Group("/workers")
			{
				workers.GET("", workerHandler.List)
				workers.GET("/:scriptName", workerHandler.GetCode)
				workers.POST("", workerHandler.Deploy)
				workers.DELETE("/:scriptName", workerHandler.Delete)
				workers.GET("/:scriptName/versions", workerHandler.ListVersions)
				workers.GET("/:scriptName/deployments", workerHandler.GetDeployments)
			}

				zones := cf.Group("/zones")
				{
					zones.GET("", zoneHandler.ListZones)
					zones.GET("/:zoneId", zoneHandler.GetZone)

					dns := zones.Group("/:zoneId/dns")
					{
						dns.GET("", zoneHandler.ListDNSRecords)
						dns.POST("", zoneHandler.CreateDNSRecord)
						dns.PUT("/:recordId", zoneHandler.UpdateDNSRecord)
						dns.DELETE("/:recordId", zoneHandler.DeleteDNSRecord)
					}

					routes := zones.Group("/:zoneId/routes")
					{
						routes.GET("", routeHandler.ListRoutes)
						routes.POST("", routeHandler.CreateRoute)
						routes.DELETE("/:routeId", routeHandler.DeleteRoute)
					}
				}

				kv := cf.Group("/kv")
				{
					kv.GET("/namespaces", kvHandler.ListNamespaces)
					kv.POST("/namespaces", kvHandler.CreateNamespace)
					kv.DELETE("/namespaces/:namespaceId", kvHandler.DeleteNamespace)
					kv.GET("/namespaces/:namespaceId/keys", kvHandler.ListKeys)
					kv.GET("/namespaces/:namespaceId/keys/:key", kvHandler.GetValue)
					kv.PUT("/namespaces/:namespaceId/keys/:key", kvHandler.PutValue)
					kv.DELETE("/namespaces/:namespaceId/keys/:key", kvHandler.DeleteKey)
				}

				d1 := cf.Group("/d1")
				{
					d1.GET("/databases", d1Handler.ListDatabases)
					d1.POST("/databases", d1Handler.CreateDatabase)
					d1.DELETE("/databases/:databaseId", d1Handler.DeleteDatabase)
					d1.POST("/databases/:databaseId/query", d1Handler.Query)
				}

			r2 := cf.Group("/r2")
			{
				r2.GET("/buckets", r2Handler.ListBuckets)
				r2.POST("/buckets", r2Handler.CreateBucket)
				r2.DELETE("/buckets/:bucketName", r2Handler.DeleteBucket)
			}

			pages := cf.Group("/pages")
			{
				pages.GET("/projects", pagesHandler.ListProjects)
				pages.POST("/projects", pagesHandler.CreateProject)
				pages.GET("/projects/:projectName", pagesHandler.GetProject)
				pages.DELETE("/projects/:projectName", pagesHandler.DeleteProject)
				pages.GET("/projects/:projectName/deployments", pagesHandler.ListDeployments)
				pages.DELETE("/projects/:projectName/deployments/:deploymentId", pagesHandler.DeleteDeployment)
			}
			}
		}
	}

	webDist := "web/dist"
	if _, err := os.Stat(webDist); err == nil {
		r.Static("/assets", filepath.Join(webDist, "assets"))
		r.StaticFile("/favicon.svg", filepath.Join(webDist, "favicon.svg"))

		r.NoRoute(func(c *gin.Context) {
			c.File(filepath.Join(webDist, "index.html"))
		})
	} else {
		r.NoRoute(func(c *gin.Context) {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		})
	}

	return r
}
